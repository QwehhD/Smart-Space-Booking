import { StatusReservasi } from '@prisma/client';

export const PESAN_RESERVASI = {
  TIDAK_TERSEDIA: 'Space tidak tersedia pada tanggal dan rentang jam tersebut!',
  TIDAK_DITEMUKAN: 'Reservasi tidak ditemukan!',
  DIBUAT: 'Reservasi berhasil dibuat! Silakan tunggu konfirmasi admin.',
  DIBATALKAN: 'Reservasi berhasil dibatalkan oleh pengguna',
  TIDAK_BISA_DIBATALKAN:
    'Reservasi dengan status ini sudah tidak dapat dibatalkan!',
  TANGGAL_LAMPAU: 'Tanggal reservasi tidak boleh di masa lalu!',
  ETIKET_DIMUAT: 'E-Ticket berhasil dimuat',
} as const;

/**
 * Status yang masih boleh dibatalkan member sendiri.
 *
 * Setelah member masuk ruangan (`aktif`) atau sewanya selesai, pembatalan tidak
 * lagi masuk akal karena spacenya sudah benar-benar terpakai; sisanya menjadi
 * urusan admin lewat perubahan status.
 */
export const STATUS_BOLEH_DIBATALKAN: readonly StatusReservasi[] = [
  StatusReservasi.belum_dikonfirm,
  StatusReservasi.disetujui,
];

/** Awalan kode booking dan nomor e-ticket, mengikuti contoh pada soal. */
export const AWALAN_KODE_BOOKING = 'BOOK';
export const AWALAN_ETIKET = 'TICKET';

/** Awalan payload QR yang dipindai admin saat check-in. */
export const AWALAN_QR = 'VERIFY-RESERVASI';
