import {
  AWALAN_ETIKET,
  AWALAN_KODE_BOOKING,
  AWALAN_QR,
} from './reservasi.constant';

/** Lebar nomor urut pada kode booking, mengikuti contoh `BOOK-20260830-0012`. */
const LEBAR_NOMOR = 4;

const tanggalRingkas = (tanggal: Date): string =>
  tanggal.toISOString().slice(0, 10).replace(/-/g, '');

const nomorUrut = (id: number): string => String(id).padStart(LEBAR_NOMOR, '0');

/**
 * Kode booking berbentuk `BOOK-YYYYMMDD-NNNN`, memakai tanggal sewa dan id
 * reservasi. Karena memuat id, kodenya baru dapat disusun setelah barisnya
 * tersimpan, sehingga penulisannya dilakukan di dalam transaksi yang sama.
 */
export function buatKodeBooking(id: number, tanggalReservasi: Date): string {
  return `${AWALAN_KODE_BOOKING}-${tanggalRingkas(tanggalReservasi)}-${nomorUrut(id)}`;
}

/**
 * Nomor e-ticket berbentuk `TICKET-MOKLET-YYYYMMDD-NNNN`, dengan bagian tengah
 * diambil dari kata pertama nama coworking seperti pada contoh soal
 * ("Moklet Hub Coworking Space" menjadi "MOKLET"). Karakter selain huruf dan
 * angka dibuang agar nomornya tetap aman dipakai di URL maupun dicetak.
 */
export function buatNomorEtiket(
  id: number,
  tanggalReservasi: Date,
  namaCoworking: string,
): string {
  const kode =
    namaCoworking
      .trim()
      .split(/\s+/)[0]
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '') || 'SPACE';

  return `${AWALAN_ETIKET}-${kode}-${tanggalRingkas(tanggalReservasi)}-${nomorUrut(id)}`;
}

/**
 * Payload QR yang dipindai admin saat check-in.
 *
 * Memuat id reservasi, yang dipakai admin untuk membuka reservasinya lalu
 * melakukan check-in. Bukan rahasia: yang menentukan boleh tidaknya check-in
 * tetap backend, yang memeriksa bahwa reservasi itu memang milik lokasi admin
 * tersebut dan statusnya sudah disetujui.
 */
export function buatPayloadQr(idReservasi: number): string {
  return `${AWALAN_QR}-${idReservasi}`;
}
