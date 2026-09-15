import { DetailReservasi, Member, Reservasi, Space } from '@prisma/client';
import { dateUtcKeTanggal } from '../utils/waktu.util';

type ReservasiLengkap = Reservasi & {
  detail: (DetailReservasi & { space: Space }) | null;
  member?: Member;
};

/**
 * Bentuk ringkas untuk daftar pemesanan milik member sendiri.
 *
 * `tanggal_reservasi` selalu diformat dari komponen UTC lewat util waktu, karena
 * kolomnya bertipe DATE sedangkan aplikasi berjalan pada zona Asia/Jakarta; tanpa
 * itu tanggalnya dapat tergeser satu hari saat ditampilkan.
 */
export const serializeReservasiRingkas = (reservasi: ReservasiLengkap) => ({
  id: reservasi.id,
  kode_booking: reservasi.kode_booking,
  tanggal_reservasi: dateUtcKeTanggal(reservasi.tanggal_reservasi),
  jam_mulai: reservasi.jam_mulai,
  jam_selesai: reservasi.jam_selesai,
  durasi_jam: reservasi.durasi_jam,
  total_bayar: reservasi.detail?.total_harga ?? 0,
  status: reservasi.status,
  space: reservasi.detail && {
    id: reservasi.detail.space.id,
    nama_space: reservasi.detail.space.nama_space,
    tipe: reservasi.detail.space.tipe,
  },
});

/** Bentuk yang dikembalikan tepat setelah reservasi dibuat. */
export const serializeReservasiBaru = (reservasi: ReservasiLengkap) => ({
  id: reservasi.id,
  kode_booking: reservasi.kode_booking,
  id_member: reservasi.id_member,
  id_space: reservasi.detail?.space.id ?? null,
  id_diskon: reservasi.detail?.id_diskon ?? null,
  tanggal_reservasi: dateUtcKeTanggal(reservasi.tanggal_reservasi),
  jam_mulai: reservasi.jam_mulai,
  jam_selesai: reservasi.jam_selesai,
  durasi_jam: reservasi.durasi_jam,
  harga_per_jam: reservasi.detail?.harga_per_jam ?? 0,
  total_harga_awal: reservasi.detail?.total_harga_awal ?? 0,
  potongan_diskon: reservasi.detail?.potongan_diskon ?? 0,
  total_bayar: reservasi.detail?.total_harga ?? 0,
  status: reservasi.status,
  created_at: reservasi.created_at,
});

/** Bentuk detail, memuat data member dan space secukupnya. */
export const serializeReservasiDetail = (
  reservasi: ReservasiLengkap & { member: Member },
) => ({
  id: reservasi.id,
  kode_booking: reservasi.kode_booking,
  id_member: reservasi.id_member,
  id_space: reservasi.detail?.space.id ?? null,
  tanggal_reservasi: dateUtcKeTanggal(reservasi.tanggal_reservasi),
  jam_mulai: reservasi.jam_mulai,
  jam_selesai: reservasi.jam_selesai,
  durasi_jam: reservasi.durasi_jam,
  total_bayar: reservasi.detail?.total_harga ?? 0,
  status: reservasi.status,
  member: {
    nama_member: reservasi.member.nama_member,
    telp: reservasi.member.telp,
  },
  space: reservasi.detail && {
    nama_space: reservasi.detail.space.nama_space,
    harga_per_jam: reservasi.detail.space.harga_per_jam,
  },
});
