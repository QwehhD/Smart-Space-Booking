/**
 * Perhitungan jam dan tanggal reservasi.
 *
 * Jam disimpan sebagai teks `HH:mm` (lihat keputusan nomor 5), sehingga selalu
 * dua digit dan perbandingan teksnya identik dengan perbandingan waktu. Semua
 * fungsi di sini menjaga bentuk itu agar pengecekan bentrok jadwal dapat
 * dilakukan langsung oleh database.
 */

const MENIT_PER_JAM = 60;

/** Mengubah `HH:mm` menjadi jumlah menit sejak tengah malam. */
export function jamKeMenit(jam: string): number {
  const [h, m] = jam.split(':').map(Number);
  return h * MENIT_PER_JAM + m;
}

/** Mengubah jumlah menit sejak tengah malam menjadi `HH:mm`. */
export function menitKeJam(menit: number): string {
  const h = Math.floor(menit / MENIT_PER_JAM);
  const m = menit % MENIT_PER_JAM;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Jam selesai dari jam mulai dan durasi. Mengembalikan null bila hasilnya
 * melewati tengah malam, karena reservasi lintas hari tidak didukung: satu baris
 * reservasi hanya memiliki satu `tanggal_reservasi`.
 */
export function hitungJamSelesai(
  jamMulai: string,
  durasiJam: number,
): string | null {
  const selesai = jamKeMenit(jamMulai) + durasiJam * MENIT_PER_JAM;
  return selesai > 24 * MENIT_PER_JAM ? null : menitKeJam(selesai);
}

/**
 * Mengubah `YYYY-MM-DD` menjadi Date tengah malam UTC.
 *
 * Kolomnya bertipe DATE dan aplikasi berjalan pada zona Asia/Jakarta, sehingga
 * `new Date('2026-08-30')` yang ditafsirkan sebagai waktu lokal akan tersimpan
 * mundur satu hari. Komponen tanggalnya karena itu disusun sendiri secara eksplisit.
 */
export function tanggalKeDateUtc(tanggal: string): Date {
  const [tahun, bulan, hari] = tanggal.split('-').map(Number);
  return new Date(Date.UTC(tahun, bulan - 1, hari));
}

/**
 * Tanggal hari ini `YYYY-MM-DD` menurut zona proses, yaitu Asia/Jakarta
 * (dipasang di main.ts). Tidak memakai `toISOString()`, karena itu tanggal UTC
 * yang tertinggal satu hari antara pukul 00.00 dan 07.00 WIB.
 */
export function tanggalHariIni(sekarang: Date = new Date()): string {
  return [
    sekarang.getFullYear(),
    String(sekarang.getMonth() + 1).padStart(2, '0'),
    String(sekarang.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Kebalikan `tanggalKeDateUtc`, selalu membaca dari komponen UTC. */
export function dateUtcKeTanggal(tanggal: Date): string {
  return tanggal.toISOString().slice(0, 10);
}
