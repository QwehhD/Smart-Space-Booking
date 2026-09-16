import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Diskon } from '@prisma/client';
import { serializeDiskon } from '../common/serializers/diskon.serializer';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { PrismaService } from '../prisma/prisma.service';
import { SpacesService } from '../spaces/spaces.service';
import { CheckPromoDto } from './dto/check-promo.dto';
import { ListDiskonQueryDto } from './dto/list-diskon.dto';

const TIDAK_DITEMUKAN = 'Kode promo tidak ditemukan!';
const TIDAK_BERLAKU = 'Kode promo tidak ditemukan atau sudah kedaluwarsa!';
const BUKAN_MILIK_SPACE = 'Kode promo tidak berlaku untuk space ini';

@Injectable()
export class DiskonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly spacesService: SpacesService,
  ) {}

  /**
   * Promo yang periodenya sedang mencakup saat ini.
   *
   * Bila `id_space` diisi, hanya promo milik pengelola space tersebut yang
   * dikembalikan, karena promo hanya berlaku pada space milik pengelola yang
   * menerbitkannya. Tanpa query itu, seluruh promo aktif pada tenant dikembalikan
   * seperti sebelumnya.
   */
  async aktif(maker: MakerContext, query: ListDiskonQueryDto = {}) {
    const idOwner = await this.ownerDariSpace(query.id_space, maker);

    const diskon = await this.prisma.diskon.findMany({
      where: {
        ...this.yangSedangBerlaku(maker),
        ...(idOwner !== undefined && { id_owner: idOwner }),
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
   * tidak dapat ditebak keberadaannya dengan mencoba-coba. Bila `id_space`
   * disertakan, kepemilikannya ikut diperiksa supaya hasil pengecekan di halaman
   * checkout sama persis dengan yang nanti diterapkan saat memesan.
   */
  async periksa(dto: CheckPromoDto, maker: MakerContext) {
    const idOwner = await this.ownerDariSpace(dto.id_space, maker);
    const diskon = await this.cariYangBerlaku(dto.nama_diskon, maker, idOwner);

    return { ...serializeDiskon(diskon), is_active: true };
  }

  /**
   * Dipakai bersama oleh pengecekan promo dan pembuatan reservasi, supaya promo
   * yang dinyatakan berlaku saat checkout adalah promo yang sama persis dengan
   * yang nanti benar-benar dipotong.
   *
   * Pencariannya difilter pemilik ketika `idOwner` diketahui, sehingga kode yang
   * sama pada dua pengelola tidak pernah tertukar.
   */
  async cariYangBerlaku(
    namaDiskon: string,
    maker: MakerContext,
    idOwner?: number,
  ): Promise<Diskon> {
    const diskon = await this.prisma.diskon.findFirst({
      where: {
        nama_diskon: namaDiskon,
        ...this.yangSedangBerlaku(maker),
        ...(idOwner !== undefined && { id_owner: idOwner }),
      },
    });

    if (!diskon) {
      await this.jelaskanKegagalan({ nama_diskon: namaDiskon }, maker, idOwner);
    }

    return diskon as Diskon;
  }

  /** Sama seperti `cariYangBerlaku`, tetapi dicari berdasarkan id. */
  async cariYangBerlakuById(
    id: number,
    maker: MakerContext,
    idOwner?: number,
  ): Promise<Diskon> {
    const diskon = await this.prisma.diskon.findFirst({
      where: {
        id,
        ...this.yangSedangBerlaku(maker),
        ...(idOwner !== undefined && { id_owner: idOwner }),
      },
    });

    if (!diskon) {
      await this.jelaskanKegagalan({ id }, maker, idOwner);
    }

    return diskon as Diskon;
  }

  /**
   * Membedakan dua sebab kegagalan yang berbeda bagi pengguna: promo yang memang
   * tidak ada atau sudah lewat, dan promo yang ada serta masih berlaku tetapi
   * diterbitkan pengelola lain. Yang kedua perlu pesannya sendiri, karena
   * pengguna sudah melihat kodenya di suatu tempat dan pantas tahu bahwa masalahnya
   * ada pada space yang ia pilih.
   */
  private async jelaskanKegagalan(
    kunci: { id: number } | { nama_diskon: string },
    maker: MakerContext,
    idOwner?: number,
  ): Promise<never> {
    if (idOwner !== undefined) {
      const milikPengelolaLain = await this.prisma.diskon.findFirst({
        where: { ...kunci, ...this.yangSedangBerlaku(maker) },
        select: { id: true },
      });

      if (milikPengelolaLain) {
        throw new BadRequestException(BUKAN_MILIK_SPACE);
      }
    }

    throw new BadRequestException(TIDAK_BERLAKU);
  }

  /** Promo pada tenant ini yang belum dihapus dan periodenya mencakup saat ini. */
  private yangSedangBerlaku(maker: MakerContext) {
    const sekarang = new Date();

    return {
      id_maker: maker.id,
      deleted_at: null,
      tanggal_awal: { lte: sekarang },
      tanggal_akhir: { gte: sekarang },
    };
  }

  /**
   * Menerjemahkan id space menjadi id pengelolanya. Space yang tidak ada atau
   * milik tenant lain ditolak di sini, sehingga pemanggil tidak perlu memeriksanya
   * sendiri.
   */
  private async ownerDariSpace(
    idSpace: number | undefined,
    maker: MakerContext,
  ): Promise<number | undefined> {
    if (idSpace === undefined) {
      return undefined;
    }

    const space = await this.spacesService.cariAtauGagal(idSpace, maker);
    return space.id_owner;
  }
}
