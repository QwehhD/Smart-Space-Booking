import { StatusReservasi } from '@prisma/client';

/**
 * Perpindahan status reservasi yang diizinkan.
 *
 * Soal tidak merinci urutan statusnya, hanya menyebut kelima nilainya. Aturan di
 * sini mengikuti alur nyata sebuah pemesanan: dikonfirmasi, lalu tamunya datang,
 * lalu selesai. Pembatalan tetap mungkin selama sewanya belum berakhir, karena
 * admin perlu jalan keluar untuk pemesanan yang batal di luar aplikasi.
 *
 * `selesai` dan `dibatalkan` bersifat akhir: keduanya sudah masuk laporan
 * pendapatan, sehingga mengubahnya kembali akan membuat laporan yang sudah
 * dicetak tidak lagi cocok dengan datanya.
 */
export const PERPINDAHAN_STATUS: Readonly<
  Record<StatusReservasi, readonly StatusReservasi[]>
> = {
  [StatusReservasi.belum_dikonfirm]: [
    StatusReservasi.disetujui,
    StatusReservasi.dibatalkan,
  ],
  [StatusReservasi.disetujui]: [
    StatusReservasi.aktif,
    StatusReservasi.selesai,
    StatusReservasi.dibatalkan,
  ],
  [StatusReservasi.aktif]: [
    StatusReservasi.selesai,
    StatusReservasi.dibatalkan,
  ],
  [StatusReservasi.selesai]: [],
  [StatusReservasi.dibatalkan]: [],
};

export function bolehPindahStatus(
  dari: StatusReservasi,
  ke: StatusReservasi,
): boolean {
  return PERPINDAHAN_STATUS[dari].includes(ke);
}
