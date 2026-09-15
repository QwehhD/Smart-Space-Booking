import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Diskon, Prisma } from '@prisma/client';
import { serializeDiskon } from '../../common/serializers/diskon.serializer';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreateDiskonDto } from './dto/create-diskon.dto';
import { UpdateDiskonDto } from './dto/update-diskon.dto';

const DISKON_TIDAK_DITEMUKAN = 'Kode promo tidak ditemukan!';
const NAMA_TERPAKAI = 'Kode promo dengan nama tersebut sudah ada!';
const PERIODE_TERBALIK =
  'Tanggal akhir promo harus setelah tanggal awal promo!';

@Injectable()
export class AdminDiskonService {
  constructor(private readonly prisma: PrismaService) {}

  async daftar(user: AuthenticatedUser) {
    const diskon = await this.prisma.diskon.findMany({
      where: this.milikAdmin(user),
      orderBy: { id: 'asc' },
    });

    return diskon.map(serializeDiskon);
  }

  async detail(id: number, user: AuthenticatedUser) {
    return serializeDiskon(await this.pastikanMilikAdmin(id, user));
  }

  async buat(dto: CreateDiskonDto, user: AuthenticatedUser) {
    const tanggalAwal = new Date(dto.tanggal_awal);
    const tanggalAkhir = new Date(dto.tanggal_akhir);
    this.pastikanPeriodeMasukAkal(tanggalAwal, tanggalAkhir);

    const diskon = await this.prisma.diskon
      .create({
        data: {
          nama_diskon: dto.nama_diskon,
          persentase_diskon: dto.persentase_diskon,
          tanggal_awal: tanggalAwal,
          tanggal_akhir: tanggalAkhir,
          id_owner: user.owner_id as number,
          id_maker: user.id_maker,
        },
      })
      .catch((error: unknown) => this.terjemahkanNamaGanda(error));

    return serializeDiskon(diskon);
  }

  async perbarui(id: number, dto: UpdateDiskonDto, user: AuthenticatedUser) {
    const sekarang = await this.pastikanMilikAdmin(id, user);

    // Periode dibandingkan setelah digabung dengan nilai tersimpan, karena soal
    // mencontohkan pembaruan yang hanya mengirim salah satu tanggalnya saja.
    const tanggalAwal = dto.tanggal_awal
      ? new Date(dto.tanggal_awal)
      : sekarang.tanggal_awal;
    const tanggalAkhir = dto.tanggal_akhir
      ? new Date(dto.tanggal_akhir)
      : sekarang.tanggal_akhir;
    this.pastikanPeriodeMasukAkal(tanggalAwal, tanggalAkhir);

    const diskon = await this.prisma.diskon
      .update({
        where: { id },
        data: {
          nama_diskon: dto.nama_diskon,
          persentase_diskon: dto.persentase_diskon,
          tanggal_awal: dto.tanggal_awal ? tanggalAwal : undefined,
          tanggal_akhir: dto.tanggal_akhir ? tanggalAkhir : undefined,
        },
      })
      .catch((error: unknown) => this.terjemahkanNamaGanda(error));

    return serializeDiskon(diskon);
  }

  /**
   * Soft delete, karena `detail_reservasi` menyimpan diskon yang dipakai pada
   * reservasi lama, sehingga nota dan laporan lama harus tetap dapat menjelaskan
   * dari mana potongan harganya berasal.
   */
  async hapus(id: number, user: AuthenticatedUser) {
    await this.pastikanMilikAdmin(id, user);

    await this.prisma.diskon.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { id, deleted: true };
  }

  private pastikanPeriodeMasukAkal(awal: Date, akhir: Date): void {
    if (akhir <= awal) {
      throw new BadRequestException(PERIODE_TERBALIK);
    }
  }

  private async pastikanMilikAdmin(
    id: number,
    user: AuthenticatedUser,
  ): Promise<Diskon> {
    const diskon = await this.prisma.diskon.findFirst({
      where: { id, ...this.milikAdmin(user) },
    });

    if (!diskon) {
      throw new NotFoundException(DISKON_TIDAK_DITEMUKAN);
    }

    return diskon;
  }

  private milikAdmin(user: AuthenticatedUser) {
    return {
      id_owner: user.owner_id as number,
      id_maker: user.id_maker,
      deleted_at: null,
    };
  }

  /**
   * Unique `(id_owner, nama_diskon)` berlaku juga untuk baris yang sudah
   * di-soft-delete, sehingga kode promo lama tidak dapat dibuat ulang dengan
   * nama yang sama. Lihat keputusan nomor 6 pada dokumen ini.
   */
  private terjemahkanNamaGanda(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(NAMA_TERPAKAI);
    }

    throw error;
  }
}
