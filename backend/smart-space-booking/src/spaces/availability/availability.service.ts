import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, StatusReservasi } from '@prisma/client';
import {
  hitungJamSelesai,
  tanggalKeDateUtc,
} from '../../common/utils/waktu.util';
import { PrismaService } from '../../prisma/prisma.service';
import { SpacesService } from '../spaces.service';
import { PESAN_SPACE } from '../spaces.constant';
import { CheckAvailabilityQueryDto } from './dto/check-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly spacesService: SpacesService,
  ) {}

  async cek(query: CheckAvailabilityQueryDto) {
    const space = await this.spacesService.cariAtauGagal(query.id_space);

    const jamSelesai = hitungJamSelesai(query.jam_mulai, query.durasi_jam);

    if (!jamSelesai) {
      throw new BadRequestException(
        'Durasi sewa tidak boleh melewati tengah malam!',
      );
    }

    this.pastikanDalamJamOperasional(query.jam_mulai, jamSelesai);

    if (
      await this.adaYangBentrok(
        query.id_space,
        tanggalKeDateUtc(query.tanggal),
        query.jam_mulai,
        jamSelesai,
      )
    ) {
      throw new BadRequestException(PESAN_SPACE.SUDAH_DIBOOKING);
    }

    return {
      available: true,
      id_space: space.id,
      nama_space: space.nama_space,
      tanggal: query.tanggal,
      jam_mulai: query.jam_mulai,
      jam_selesai: jamSelesai,
      durasi_jam: query.durasi_jam,
      harga_per_jam: space.harga_per_jam,
      estimasi_total: space.harga_per_jam * query.durasi_jam,
    };
  }

  /**
   * Dua jadwal bertabrakan bila yang satu mulai sebelum yang lain selesai dan
   * selesai setelah yang lain mulai. Jadwal yang bersambung persis, misalnya
   * 09:00-12:00 dan 12:00-14:00, tidak dianggap bentrok.
   *
   * Perbandingannya diserahkan ke database karena jam tersimpan sebagai `HH:mm`
   * yang selalu dua digit, sehingga urutan teksnya sama dengan urutan waktu.
   */
  async adaYangBentrok(
    idSpace: number,
    tanggal: Date,
    jamMulai: string,
    jamSelesai: string,
    kecualiIdReservasi?: number,
    // Pembuatan reservasi memanggil ini dari dalam transaksinya sendiri, supaya
    // pengecekan bentrok dan penyimpanan baris terjadi pada transaksi yang sama.
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const bentrok = await (tx ?? this.prisma).reservasi.findFirst({
      where: {
        tanggal_reservasi: tanggal,
        // Reservasi yang dibatalkan melepaskan kembali jadwalnya.
        status: { not: StatusReservasi.dibatalkan },
        jam_mulai: { lt: jamSelesai },
        jam_selesai: { gt: jamMulai },
        detail: { id_space: idSpace },
        ...(kecualiIdReservasi && { id: { not: kecualiIdReservasi } }),
      },
      select: { id: true },
    });

    return bentrok !== null;
  }

  /** Dipakai juga oleh pembuatan reservasi, agar aturannya hanya ada satu. */
  pastikanDalamJamOperasional(jamMulai: string, jamSelesai: string): void {
    const buka = this.config.get<string>('jamOperasional.buka') ?? '07:00';
    const tutup = this.config.get<string>('jamOperasional.tutup') ?? '22:00';

    if (jamMulai < buka || jamSelesai > tutup) {
      throw new BadRequestException(
        `Jam sewa harus berada dalam jam operasional ${buka} sampai ${tutup}!`,
      );
    }
  }
}
