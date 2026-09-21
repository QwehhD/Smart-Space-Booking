import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Space, SpaceOwner } from '@prisma/client';
import { serializeSpacePublik } from '../common/serializers/space.serializer';
import { PrismaService } from '../prisma/prisma.service';
import { ListSpacesQueryDto } from './dto/list-spaces.dto';
import { PESAN_SPACE, TIPE_SPACE } from './spaces.constant';

@Injectable()
export class SpacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Keterangan kategori space; tetap dan tidak bergantung pada tenant. */
  tipe() {
    return TIPE_SPACE;
  }

  async daftar(query: ListSpacesQueryDto) {
    const spaces = await this.prisma.space.findMany({
      where: {
        deleted_at: null,
        ...(query.tipe && { tipe: query.tipe }),
        // Soal menyebut pencarian mencakup nama space dan fasilitasnya, dan
        // fasilitas itulah yang tersimpan pada kolom deskripsi.
        ...(query.search && {
          OR: [
            { nama_space: { contains: query.search } },
            { deskripsi: { contains: query.search } },
          ],
        }),
      },
      include: { owner: true },
      orderBy: { id: 'asc' },
    });

    return spaces.map((space) => this.tampilkan(space));
  }

  async detail(id: number) {
    return this.tampilkan(await this.cariAtauGagal(id));
  }

  /**
   * Space yang masih disewakan. Dipakai bersama oleh katalog dan pengecekan
   * ketersediaan supaya keduanya tidak pernah berbeda pendapat tentang space
   * mana yang ada.
   */
  async cariAtauGagal(id: number): Promise<Space & { owner: SpaceOwner }> {
    const space = await this.prisma.space.findFirst({
      where: { id, deleted_at: null },
      include: { owner: true },
    });

    if (!space) {
      throw new NotFoundException(PESAN_SPACE.TIDAK_DITEMUKAN);
    }

    return space;
  }

  private tampilkan(space: Space & { owner: SpaceOwner }) {
    return serializeSpacePublik(
      space,
      this.config.getOrThrow<string>('foto.baseUrl'),
    );
  }
}
