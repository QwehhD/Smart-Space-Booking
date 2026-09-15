import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Diskon } from '@prisma/client';
import { serializeDiskon } from '../common/serializers/diskon.serializer';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CheckPromoDto } from './dto/check-promo.dto';

const TIDAK_DITEMUKAN = 'Kode promo tidak ditemukan!';
const TIDAK_BERLAKU = 'Kode promo tidak ditemukan atau sudah kedaluwarsa!';

@Injectable()
export class DiskonService {
  constructor(private readonly prisma: PrismaService) {}

  /** Promo yang periodenya sedang mencakup saat ini. */
  async aktif(maker: MakerContext) {
    const sekarang = new Date();

    const diskon = await this.prisma.diskon.findMany({
      where: {
        id_maker: maker.id,
        deleted_at: null,
        tanggal_awal: { lte: sekarang },
        tanggal_akhir: { gte: sekarang },
      },
      orderBy: { id: 'asc' },
    });

    return diskon.map(serializeDiskon);
  }

  async detail(id: number, maker: MakerContext) {
    const diskon = await this.prisma.diskon.findFirst({
      where: { id, id_maker: maker.id, deleted_at: null },
    });

    if (!diskon) {
      throw new NotFoundException(TIDAK_DITEMUKAN);
    }

    return serializeDiskon(diskon);
  }

  /**
   * Memeriksa kode promo yang diketik pengguna pada form checkout.
   *
   * Kode yang tidak ada dan kode yang sudah lewat masa berlakunya dibalas dengan
   * pesan yang sama seperti dicontohkan soal, sehingga kode promo milik pengelola
   * tidak dapat ditebak keberadaannya dengan mencoba-coba.
   */
  async periksa(dto: CheckPromoDto, maker: MakerContext) {
    const diskon = await this.cariYangBerlaku(dto.nama_diskon, maker);

    return { ...serializeDiskon(diskon), is_active: true };
  }

  /** Sama seperti `cariYangBerlaku`, tetapi dicari berdasarkan id. */
  async cariYangBerlakuById(id: number, maker: MakerContext): Promise<Diskon> {
    const diskon = await this.prisma.diskon.findFirst({
      where: {
        id,
        id_maker: maker.id,
        deleted_at: null,
        tanggal_awal: { lte: new Date() },
        tanggal_akhir: { gte: new Date() },
      },
    });

    if (!diskon) {
      throw new BadRequestException(TIDAK_BERLAKU);
    }

    return diskon;
  }

  /**
   * Dipakai bersama oleh pengecekan promo dan pembuatan reservasi, supaya promo
   * yang dinyatakan berlaku saat checkout adalah promo yang sama persis dengan
   * yang nanti benar-benar dipotong.
   */
  async cariYangBerlaku(
    namaDiskon: string,
    maker: MakerContext,
  ): Promise<Diskon> {
    const sekarang = new Date();

    const diskon = await this.prisma.diskon.findFirst({
      where: {
        nama_diskon: namaDiskon,
        id_maker: maker.id,
        deleted_at: null,
        tanggal_awal: { lte: sekarang },
        tanggal_akhir: { gte: sekarang },
      },
    });

    if (!diskon) {
      throw new BadRequestException(TIDAK_BERLAKU);
    }

    return diskon;
  }
}
