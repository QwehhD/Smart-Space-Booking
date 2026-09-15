import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Space } from '@prisma/client';
import { serializeSpace } from '../../common/serializers/space.serializer';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

const SPACE_TIDAK_DITEMUKAN = 'Space tidak ditemukan!';

@Injectable()
export class AdminSpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async daftar(user: AuthenticatedUser) {
    const spaces = await this.prisma.space.findMany({
      where: this.milikAdmin(user),
      orderBy: { id: 'asc' },
    });

    return spaces.map((space) => this.tampilkan(space));
  }

  async detail(id: number, user: AuthenticatedUser) {
    return this.tampilkan(await this.pastikanMilikAdmin(id, user));
  }

  async buat(dto: CreateSpaceDto, user: AuthenticatedUser) {
    const space = await this.prisma.space.create({
      data: {
        nama_space: dto.nama_space,
        harga_per_jam: dto.harga_per_jam,
        tipe: dto.tipe,
        kapasitas: dto.kapasitas,
        deskripsi: dto.deskripsi,
        foto: dto.foto ?? null,
        id_owner: user.owner_id as number,
        id_maker: user.id_maker,
      },
    });

    return this.tampilkan(space);
  }

  async perbarui(id: number, dto: UpdateSpaceDto, user: AuthenticatedUser) {
    await this.pastikanMilikAdmin(id, user);

    const space = await this.prisma.space.update({
      where: { id },
      // Field yang tidak dikirim bernilai undefined, dan Prisma mengabaikannya,
      // sehingga pembaruan sebagian tidak mengosongkan field lain.
      data: {
        nama_space: dto.nama_space,
        harga_per_jam: dto.harga_per_jam,
        tipe: dto.tipe,
        kapasitas: dto.kapasitas,
        deskripsi: dto.deskripsi,
        foto: dto.foto,
      },
    });

    return this.tampilkan(space);
  }

  /**
   * Penghapusan bersifat soft delete karena reservasi lama masih merujuk ke
   * space ini lewat `detail_reservasi`, sehingga riwayat dan laporan pendapatan
   * harus tetap dapat dibaca setelah space tidak lagi disewakan.
   */
  async hapus(id: number, user: AuthenticatedUser) {
    await this.pastikanMilikAdmin(id, user);

    await this.prisma.space.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { id, deleted: true };
  }

  /**
   * Kepemilikan diperiksa sebagai bagian dari pencarian, bukan lewat guard
   * terpisah, karena datanya memang perlu dibaca. Space milik admin lain dibalas
   * "tidak ditemukan", bukan "tidak berhak", supaya keberadaan data milik orang
   * lain tidak dapat ditebak dari perbedaan pesan.
   */
  private async pastikanMilikAdmin(
    id: number,
    user: AuthenticatedUser,
  ): Promise<Space> {
    const space = await this.prisma.space.findFirst({
      where: { id, ...this.milikAdmin(user) },
    });

    if (!space) {
      throw new NotFoundException(SPACE_TIDAK_DITEMUKAN);
    }

    return space;
  }

  /** Space milik admin ini, pada tenant ini, dan belum dihapus. */
  private milikAdmin(user: AuthenticatedUser) {
    return {
      id_owner: user.owner_id as number,
      id_maker: user.id_maker,
      deleted_at: null,
    };
  }

  private tampilkan(space: Space) {
    return serializeSpace(
      space,
      this.config.get<string>('appUrl') ?? 'http://localhost:3000',
    );
  }
}
