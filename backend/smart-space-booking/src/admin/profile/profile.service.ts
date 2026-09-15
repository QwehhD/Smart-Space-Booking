import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { serializeSpaceOwner } from '../../common/serializers/profil.serializer';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AdminProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async lihat(idOwner: number) {
    const owner = await this.prisma.spaceOwner.findUniqueOrThrow({
      where: { id: idOwner },
    });

    return serializeSpaceOwner(owner, this.appUrl);
  }

  /**
   * Hanya field yang dikirim yang diperbarui. Field opsional yang tidak
   * disertakan dibiarkan apa adanya, bukan dikosongkan, supaya request tiga field
   * seperti contoh pada soal tidak menghapus alamat dan deskripsi yang sudah ada.
   */
  async perbarui(idOwner: number, dto: UpdateProfileDto) {
    const owner = await this.prisma.spaceOwner.update({
      where: { id: idOwner },
      data: {
        nama_coworking: dto.nama_coworking,
        nama_pemilik: dto.nama_pemilik,
        telp: dto.telp,
        ...(dto.alamat !== undefined && { alamat: dto.alamat }),
        ...(dto.deskripsi !== undefined && { deskripsi: dto.deskripsi }),
        ...(dto.foto !== undefined && { foto: dto.foto }),
      },
    });

    return serializeSpaceOwner(owner, this.appUrl);
  }

  private get appUrl(): string {
    return this.config.get<string>('appUrl') ?? 'http://localhost:3000';
  }
}
