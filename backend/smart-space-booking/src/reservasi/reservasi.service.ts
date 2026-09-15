import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Diskon, Prisma, Role, StatusReservasi } from '@prisma/client';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  serializeReservasiBaru,
  serializeReservasiDetail,
  serializeReservasiRingkas,
} from '../common/serializers/reservasi.serializer';
import {
  hitungPotongan,
  hitungTarifKotor,
  hitungTotalBayar,
} from '../common/utils/uang.util';
import { hitungJamSelesai, tanggalKeDateUtc } from '../common/utils/waktu.util';
import { DiskonService } from '../diskon/diskon.service';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from '../spaces/availability/availability.service';
import { SpacesService } from '../spaces/spaces.service';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { PESAN_RESERVASI, STATUS_BOLEH_DIBATALKAN } from './reservasi.constant';
import { buatKodeBooking } from './reservasi.util';

/** Kolom relasi yang selalu dibutuhkan saat menampilkan reservasi. */
const SERTAKAN_DETAIL = {
  detail: { include: { space: true } },
  member: true,
} as const;

@Injectable()
export class ReservasiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
    private readonly availabilityService: AvailabilityService,
    private readonly diskonService: DiskonService,
  ) {}

  /**
   * Membuat pemesanan baru.
   *
   * Harga, potongan, dan total dihitung di server dari data space dan promo yang
   * tersimpan, tidak pernah dari nilai kiriman klien, supaya harga tidak dapat
   * ditentukan sendiri oleh pemesan.
   */
  async buat(
    dto: CreateReservasiDto,
    user: AuthenticatedUser,
    maker: MakerContext,
  ) {
    const space = await this.spacesService.cariAtauGagal(dto.id_space, maker);
    const tanggal = tanggalKeDateUtc(dto.tanggal_reservasi);
    const jamSelesai = this.hitungJamSelesaiAtauGagal(
      dto.jam_mulai,
      dto.durasi_jam,
    );

    this.pastikanBukanMasaLalu(tanggal);
    this.availabilityService.pastikanDalamJamOperasional(
      dto.jam_mulai,
      jamSelesai,
    );

    const diskon = await this.cariDiskon(dto, maker);
    const tarifKotor = hitungTarifKotor(space.harga_per_jam, dto.durasi_jam);
    const potongan = diskon
      ? hitungPotongan(tarifKotor, diskon.persentase_diskon)
      : 0;

    const reservasi = await this.prisma.$transaction(
      async (tx) => {
        // Pengecekan bentrok diulang di dalam transaksi, karena pengecekan di
        // luar transaksi masih dapat kalah balapan dengan pemesanan lain yang
        // berjalan bersamaan pada jadwal yang sama.
        if (
          await this.availabilityService.adaYangBentrok(
            dto.id_space,
            tanggal,
            dto.jam_mulai,
            jamSelesai,
            maker,
            undefined,
            tx,
          )
        ) {
          throw new BadRequestException(PESAN_RESERVASI.TIDAK_TERSEDIA);
        }

        const baru = await tx.reservasi.create({
          data: {
            // Kode booking memuat id barisnya sendiri, sehingga baru dapat
            // disusun setelah baris tersimpan dan ditulis tepat sesudahnya.
            kode_booking: `SEMENTARA-${Date.now()}`,
            tanggal_reservasi: tanggal,
            jam_mulai: dto.jam_mulai,
            jam_selesai: jamSelesai,
            durasi_jam: dto.durasi_jam,
            id_owner: space.id_owner,
            id_member: user.member_id as number,
            id_maker: maker.id,
            status: StatusReservasi.belum_dikonfirm,
            detail: {
              create: {
                id_space: space.id,
                id_diskon: diskon?.id ?? null,
                // Harga disalin ke detail supaya nota lama tetap menunjukkan
                // harga saat pemesanan, meski tarif space berubah kemudian.
                harga_per_jam: space.harga_per_jam,
                total_harga_awal: tarifKotor,
                persentase_diskon: diskon?.persentase_diskon ?? 0,
                potongan_diskon: potongan,
                total_harga: hitungTotalBayar(tarifKotor, potongan),
              },
            },
          },
        });

        return tx.reservasi.update({
          where: { id: baru.id },
          data: { kode_booking: buatKodeBooking(baru.id, tanggal) },
          include: SERTAKAN_DETAIL,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return serializeReservasiBaru(reservasi);
  }

  /** Seluruh pemesanan milik member sendiri, terbaru lebih dulu. */
  async milikSaya(user: AuthenticatedUser, maker: MakerContext) {
    const reservasi = await this.prisma.reservasi.findMany({
      where: { id_maker: maker.id, id_member: user.member_id as number },
      include: SERTAKAN_DETAIL,
      orderBy: [{ tanggal_reservasi: 'desc' }, { id: 'desc' }],
    });

    return reservasi.map(serializeReservasiRingkas);
  }

  /**
   * Histori per bulan beserta rekap pengeluarannya.
   *
   * Bulan dan tahun yang tidak dikirim diisi dengan bulan berjalan, karena soal
   * menyatakan keduanya opsional tetapi tetap menampilkan `month` dan `year` pada
   * responsnya.
   *
   * Reservasi yang dibatalkan tidak dihitung sebagai pengeluaran karena tidak
   * jadi dibayar, tetapi tetap ditampilkan pada daftar agar member dapat melihat
   * riwayat pembatalannya.
   */
  async histori(
    query: HistoryQueryDto,
    user: AuthenticatedUser,
    maker: MakerContext,
  ) {
    const sekarang = new Date();
    const month = query.month ?? sekarang.getMonth() + 1;
    const year = query.year ?? sekarang.getFullYear();

    const awal = new Date(Date.UTC(year, month - 1, 1));
    const awalBulanBerikutnya = new Date(Date.UTC(year, month, 1));

    const reservasi = await this.prisma.reservasi.findMany({
      where: {
        id_maker: maker.id,
        id_member: user.member_id as number,
        tanggal_reservasi: { gte: awal, lt: awalBulanBerikutnya },
      },
      include: SERTAKAN_DETAIL,
      orderBy: [{ tanggal_reservasi: 'asc' }, { id: 'asc' }],
    });

    const totalPengeluaran = reservasi
      .filter((r) => r.status !== StatusReservasi.dibatalkan)
      .reduce((jumlah, r) => jumlah + (r.detail?.total_harga ?? 0), 0);

    return {
      month,
      year,
      total_reservasi: reservasi.length,
      total_pengeluaran: totalPengeluaran,
      items: reservasi.map((r) => ({
        ...serializeReservasiRingkas(r),
        space: undefined,
        space_name: r.detail?.space.nama_space ?? null,
      })),
    };
  }

  /**
   * Detail satu reservasi. Member hanya boleh membuka miliknya sendiri,
   * sedangkan admin space boleh membuka reservasi pada lokasinya.
   */
  async detail(id: number, user: AuthenticatedUser, maker: MakerContext) {
    return serializeReservasiDetail(
      await this.cariYangBolehDilihat(id, user, maker),
    );
  }

  /**
   * Pembatalan oleh member sendiri. Hanya reservasi yang belum berjalan yang
   * dapat dibatalkan; setelah member masuk ruangan, pembatalan menjadi urusan
   * admin lewat perubahan status.
   */
  async batalkan(id: number, user: AuthenticatedUser, maker: MakerContext) {
    const reservasi = await this.cariMilikMember(id, user, maker);

    if (!STATUS_BOLEH_DIBATALKAN.includes(reservasi.status)) {
      throw new BadRequestException(PESAN_RESERVASI.TIDAK_BISA_DIBATALKAN);
    }

    const dibatalkan = await this.prisma.reservasi.update({
      where: { id },
      data: {
        status: StatusReservasi.dibatalkan,
        catatan_batal: 'Dibatalkan oleh member',
      },
    });

    return {
      id: dibatalkan.id,
      status: dibatalkan.status,
      updated_at: dibatalkan.updated_at,
    };
  }

  /**
   * Promo yang diketik manual didahulukan daripada yang dipilih dari katalog,
   * karena kode manual adalah tindakan terakhir pengguna pada form checkout.
   */
  private async cariDiskon(
    dto: CreateReservasiDto,
    maker: MakerContext,
  ): Promise<Diskon | null> {
    if (dto.kode_promo?.trim()) {
      return this.diskonService.cariYangBerlaku(dto.kode_promo.trim(), maker);
    }

    if (dto.id_diskon) {
      return this.diskonService.cariYangBerlakuById(dto.id_diskon, maker);
    }

    return null;
  }

  private hitungJamSelesaiAtauGagal(jamMulai: string, durasi: number): string {
    const jamSelesai = hitungJamSelesai(jamMulai, durasi);

    if (!jamSelesai) {
      throw new BadRequestException(
        'Durasi sewa tidak boleh melewati tengah malam!',
      );
    }

    return jamSelesai;
  }

  /** Tanggal dibandingkan pada tingkat hari, sehingga hari ini masih boleh. */
  private pastikanBukanMasaLalu(tanggal: Date): void {
    const sekarang = new Date();
    const hariIni = new Date(
      Date.UTC(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate()),
    );

    if (tanggal < hariIni) {
      throw new BadRequestException(PESAN_RESERVASI.TANGGAL_LAMPAU);
    }
  }

  /** Dipakai EtiketService, yang memakai aturan akses yang sama dengan detail. */
  cariUntukEtiket(id: number, user: AuthenticatedUser, maker: MakerContext) {
    return this.cariYangBolehDilihat(id, user, maker);
  }

  /**
   * Reservasi yang boleh dilihat pengguna ini: miliknya sendiri bila member,
   * atau yang berada di lokasinya bila admin space.
   */
  private async cariYangBolehDilihat(
    id: number,
    user: AuthenticatedUser,
    maker: MakerContext,
  ) {
    const reservasi = await this.prisma.reservasi.findFirst({
      where: {
        id,
        id_maker: maker.id,
        ...(user.role === Role.admin_space
          ? { id_owner: user.owner_id as number }
          : { id_member: user.member_id as number }),
      },
      include: SERTAKAN_DETAIL,
    });

    if (!reservasi) {
      throw new NotFoundException(PESAN_RESERVASI.TIDAK_DITEMUKAN);
    }

    return reservasi;
  }

  /** Reservasi milik member ini pada tenant ini. */
  private async cariMilikMember(
    id: number,
    user: AuthenticatedUser,
    maker: MakerContext,
  ) {
    const reservasi = await this.prisma.reservasi.findFirst({
      where: { id, id_maker: maker.id, id_member: user.member_id as number },
      include: SERTAKAN_DETAIL,
    });

    if (!reservasi) {
      throw new NotFoundException(PESAN_RESERVASI.TIDAK_DITEMUKAN);
    }

    return reservasi;
  }
}
