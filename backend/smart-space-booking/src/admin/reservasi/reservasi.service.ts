import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatusReservasi } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { serializeReservasiAdmin } from '../../common/serializers/reservasi.serializer';
import {
  dateUtcKeTanggal,
  tanggalHariIni,
  tanggalKeDateUtc,
} from '../../common/utils/waktu.util';
import { denganPesan } from '../../common/responses/pesan-dinamis';
import { PrismaService } from '../../prisma/prisma.service';
import { ListReservasiQueryDto } from './dto/list-reservasi.dto';
import { UpdateReservasiStatusDto } from './dto/update-status.dto';
import { bolehPindahStatus } from './status-machine';

const TIDAK_DITEMUKAN = 'Reservasi tidak ditemukan!';

const SERTAKAN = {
  detail: { include: { space: true } },
  member: true,
} as const;

@Injectable()
export class AdminReservasiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async daftar(query: ListReservasiQueryDto, user: AuthenticatedUser) {
    const reservasi = await this.prisma.reservasi.findMany({
      where: {
        ...this.milikAdmin(user),
        ...this.filterTanggal(query),
        ...(query.status && { status: query.status }),
        ...(query.id_space && { detail: { id_space: query.id_space } }),
      },
      include: SERTAKAN,
      orderBy: [{ tanggal_reservasi: 'desc' }, { id: 'desc' }],
    });

    return reservasi.map(serializeReservasiAdmin);
  }

  /**
   * Mengubah status secara manual, mengikuti perpindahan yang diizinkan.
   * Perpindahan yang tidak masuk akal ditolak agar laporan pendapatan tidak
   * memuat reservasi yang statusnya melompat-lompat.
   */
  async ubahStatus(
    id: number,
    dto: UpdateReservasiStatusDto,
    user: AuthenticatedUser,
  ) {
    const reservasi = await this.pastikanMilikAdmin(id, user);

    if (!bolehPindahStatus(reservasi.status, dto.status)) {
      throw new BadRequestException(
        `Status reservasi tidak dapat diubah dari ${reservasi.status} menjadi ${dto.status}!`,
      );
    }

    const diperbarui = await this.prisma.reservasi.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === StatusReservasi.dibatalkan && {
          catatan_batal: 'Dibatalkan oleh admin',
        }),
      },
    });

    return denganPesan(
      `Status reservasi berhasil diperbarui menjadi ${diperbarui.status}`,
      {
        id: diperbarui.id,
        status: diperbarui.status,
        updated_at: diperbarui.updated_at,
      },
    );
  }

  /**
   * Check-in hanya untuk reservasi yang sudah disetujui, dan waktunya dicatat
   * agar admin dapat menelusuri kapan tamunya benar-benar datang.
   */
  async checkIn(id: number, user: AuthenticatedUser) {
    const reservasi = await this.pastikanMilikAdmin(id, user);

    if (reservasi.status !== StatusReservasi.disetujui) {
      throw new BadRequestException(
        'Check-in hanya dapat dilakukan pada reservasi yang sudah disetujui!',
      );
    }

    this.pastikanTanggalCheckIn(reservasi.tanggal_reservasi);

    const diperbarui = await this.prisma.reservasi.update({
      where: { id },
      data: { status: StatusReservasi.aktif, check_in_time: new Date() },
    });

    return {
      id: diperbarui.id,
      status: diperbarui.status,
      check_in_time: diperbarui.check_in_time,
    };
  }

  /** Check-out hanya untuk reservasi yang sedang berjalan. */
  async checkOut(id: number, user: AuthenticatedUser) {
    const reservasi = await this.pastikanMilikAdmin(id, user);

    if (reservasi.status !== StatusReservasi.aktif) {
      throw new BadRequestException(
        'Check-out hanya dapat dilakukan pada reservasi yang sedang aktif!',
      );
    }

    const diperbarui = await this.prisma.reservasi.update({
      where: { id },
      data: { status: StatusReservasi.selesai, check_out_time: new Date() },
    });

    return {
      id: diperbarui.id,
      status: diperbarui.status,
      check_out_time: diperbarui.check_out_time,
    };
  }

  /**
   * Check-in hanya boleh pada hari sewanya, supaya tamu tidak dapat dicatat
   * datang untuk jadwal yang belum atau sudah lewat. Aturan ini dapat dimatikan
   * dengan `STRICT_CHECKIN_DATE=false`, misalnya untuk demonstrasi.
   *
   * Check-out sengaja tidak dibatasi tanggal: tamu yang lupa di-check-out harus
   * tetap dapat ditutup keesokan harinya, bukan tertahan aktif selamanya.
   */
  private pastikanTanggalCheckIn(tanggalReservasi: Date): void {
    if (!this.config.get<boolean>('strictCheckinDate')) {
      return;
    }

    if (dateUtcKeTanggal(tanggalReservasi) !== tanggalHariIni()) {
      throw new BadRequestException(
        'Check-in hanya dapat dilakukan pada tanggal reservasinya!',
      );
    }
  }

  private filterTanggal(query: ListReservasiQueryDto) {
    if (query.tanggal) {
      return { tanggal_reservasi: tanggalKeDateUtc(query.tanggal) };
    }

    if (!query.month && !query.year) {
      return {};
    }

    const sekarang = new Date();
    const month = query.month ?? sekarang.getMonth() + 1;
    const year = query.year ?? sekarang.getFullYear();

    return {
      tanggal_reservasi: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(year, month, 1)),
      },
    };
  }

  private async pastikanMilikAdmin(id: number, user: AuthenticatedUser) {
    const reservasi = await this.prisma.reservasi.findFirst({
      where: { id, ...this.milikAdmin(user) },
      include: SERTAKAN,
    });

    if (!reservasi) {
      throw new NotFoundException(TIDAK_DITEMUKAN);
    }

    return reservasi;
  }

  private milikAdmin(user: AuthenticatedUser) {
    return { id_owner: user.owner_id as number };
  }
}
