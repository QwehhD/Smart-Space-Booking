import { Injectable } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { dateUtcKeTanggal } from '../common/utils/waktu.util';
import { PrismaService } from '../prisma/prisma.service';
import { TIPE_SPACE } from '../spaces/spaces.constant';
import { buatNomorEtiket, buatPayloadQr } from './reservasi.util';
import { ReservasiService } from './reservasi.service';

@Injectable()
export class EtiketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservasiService: ReservasiService,
  ) {}

  /**
   * Nota digital reservasi.
   *
   * Seluruh angkanya dibaca dari `detail_reservasi`, bukan dihitung ulang dari
   * tarif space saat ini, supaya tiket lama tetap menunjukkan harga yang benar
   * meski tarif spacenya sudah berubah.
   */
  async muat(id: number, user: AuthenticatedUser) {
    const reservasi = await this.reservasiService.cariUntukEtiket(id, user);
    const owner = await this.prisma.spaceOwner.findUniqueOrThrow({
      where: { id: reservasi.id_owner },
    });

    const detail = reservasi.detail;
    const diskon = detail?.id_diskon
      ? await this.prisma.diskon.findUnique({ where: { id: detail.id_diskon } })
      : null;

    const payloadQr = buatPayloadQr(reservasi.id);

    return {
      e_ticket_number: buatNomorEtiket(
        reservasi.id,
        reservasi.tanggal_reservasi,
        owner.nama_coworking,
      ),
      kode_booking: reservasi.kode_booking,
      coworking_space: {
        nama: owner.nama_coworking,
        telepon: owner.telp,
      },
      member: {
        nama: reservasi.member.nama_member,
        instansi: reservasi.member.instansi,
        telp: reservasi.member.telp,
      },
      space: {
        nama: detail?.space.nama_space ?? null,
        tipe: this.labelTipe(detail?.space.tipe),
        harga_per_jam: detail?.harga_per_jam ?? 0,
      },
      jadwal: {
        tanggal: dateUtcKeTanggal(reservasi.tanggal_reservasi),
        jam_mulai: reservasi.jam_mulai,
        jam_selesai: reservasi.jam_selesai,
        durasi: `${reservasi.durasi_jam} Jam`,
      },
      rincian_pembayaran: {
        tarif_kotor: detail?.total_harga_awal ?? 0,
        diskon_promo: diskon
          ? `${detail?.persentase_diskon ?? 0}% (${diskon.nama_diskon})`
          : null,
        potongan: detail?.potongan_diskon ?? 0,
        total_dibayar: detail?.total_harga ?? 0,
      },
      status_reservasi: reservasi.status,
      qr_code_payload: payloadQr,
      // Gambar QR disertakan sebagai data URI agar frontend dapat langsung
      // menampilkannya tanpa memasang pustaka QR sendiri. Soal mensyaratkan
      // e-ticket memuat QR Code untuk check-in, sedangkan contoh responsnya hanya
      // menampilkan payloadnya.
      qr_code_data_url: await toDataURL(payloadQr, { width: 240, margin: 1 }),
    };
  }

  /** Label tipe space yang ramah dibaca, sama dengan `GET /api/spaces/types`. */
  private labelTipe(tipe?: string): string | null {
    return TIPE_SPACE.find((t) => t.tipe === tipe)?.label ?? null;
  }
}
