import { Injectable } from '@nestjs/common';
import {
  DetailReservasi,
  Reservasi,
  Space,
  StatusReservasi,
} from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { TIPE_SPACE } from '../../spaces/spaces.constant';
import { ReportQueryDto } from './dto/report-query.dto';

/** Reservasi beserta rincian harga dan spacenya, sebagaimana dibaca laporan. */
type ReservasiDenganDetail = Reservasi & {
  detail: (DetailReservasi & { space: Space }) | null;
};

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Rekap pendapatan satu bulan.
   *
   * Reservasi yang dibatalkan tidak diikutkan karena tidak menghasilkan
   * pendapatan. Sisanya diikutkan seluruhnya, termasuk yang belum dikonfirmasi,
   * sebab itulah yang membuat angkanya disebut "estimasi": pemesanan yang sudah
   * masuk tetapi belum tentu terealisasi.
   *
   * Seluruh angka dibaca dari `detail_reservasi`, yang menyimpan harga saat
   * pemesanan, sehingga laporan bulan lalu tidak ikut berubah ketika tarif space
   * dinaikkan hari ini.
   */
  async bulanan(query: ReportQueryDto, user: AuthenticatedUser) {
    const sekarang = new Date();
    const month = query.month ?? sekarang.getMonth() + 1;
    const year = query.year ?? sekarang.getFullYear();

    const reservasi = await this.prisma.reservasi.findMany({
      where: {
        id_owner: user.owner_id as number,
        id_maker: user.id_maker,
        status: { not: StatusReservasi.dibatalkan },
        tanggal_reservasi: {
          gte: new Date(Date.UTC(year, month - 1, 1)),
          lt: new Date(Date.UTC(year, month, 1)),
        },
      },
      include: { detail: { include: { space: true } } },
    });

    const kotor = this.jumlahkan(reservasi, (d) => d.total_harga_awal);
    const potongan = this.jumlahkan(reservasi, (d) => d.potongan_diskon);
    const bersih = this.jumlahkan(reservasi, (d) => d.total_harga);

    return {
      month,
      year,
      total_transaksi: reservasi.length,
      total_jam_terpakai: reservasi.reduce((j, r) => j + r.durasi_jam, 0),
      estimasi_pendapatan_kotor: kotor,
      total_potongan_diskon: potongan,
      realisasi_pendapatan_bersih: bersih,
      rincian_per_tipe_space: this.rincianPerTipe(reservasi),
    };
  }

  /** Alias ringkas dari laporan bulanan, sesuai soal. */
  async pendapatan(query: ReportQueryDto, user: AuthenticatedUser) {
    const laporan = await this.bulanan(query, user);

    return {
      month: laporan.month,
      year: laporan.year,
      realisasi_pendapatan_bersih: laporan.realisasi_pendapatan_bersih,
    };
  }

  /**
   * Ketiga tipe space selalu ditampilkan meski nilainya nol, supaya grafik pada
   * frontend memiliki kategori yang tetap dan tidak berubah-ubah bentuknya dari
   * bulan ke bulan.
   */
  private rincianPerTipe(reservasi: ReadonlyArray<ReservasiDenganDetail>) {
    return TIPE_SPACE.map(({ tipe, label }) => {
      const cocok = reservasi.filter((r) => r.detail?.space.tipe === tipe);

      return {
        tipe,
        label,
        total_booking: cocok.length,
        total_jam: cocok.reduce((j, r) => j + r.durasi_jam, 0),
        total_pendapatan: this.jumlahkan(cocok, (d) => d.total_harga),
      };
    });
  }

  private jumlahkan(
    reservasi: ReadonlyArray<ReservasiDenganDetail>,
    ambil: (detail: NonNullable<ReservasiDenganDetail['detail']>) => number,
  ): number {
    return reservasi.reduce(
      (jumlah, r) => jumlah + (r.detail ? ambil(r.detail) : 0),
      0,
    );
  }
}
