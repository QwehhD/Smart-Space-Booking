import type { Jam, TanggalISO, WaktuISO } from '@/types/entities';

/**
 * Pemformatan nilai untuk tampilan.
 *
 * Seluruh perhitungan "hari ini" dan penampilan tanggal memakai zona
 * Asia/Jakarta. Backend mengirim tanggal sewa sebagai teks `YYYY-MM-DD` tanpa
 * zona, sehingga `new Date('2026-08-30')` akan ditafsirkan sebagai tengah malam
 * UTC lalu digeser ke zona lokal saat diformat, dan di Indonesia hasilnya masih
 * 30 Agustus. Namun untuk zona di sebelah barat UTC hasilnya mundur satu hari.
 * Karena itu tanggal polos selalu dipecah menjadi komponennya sendiri, tidak
 * pernah melewati konstruktor Date yang bergantung zona.
 */

export const ZONA_WIB = 'Asia/Jakarta';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

const NAMA_HARI = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
] as const;

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/** `360000` menjadi `Rp 360.000`. */
export function rupiah(nilai: number): string {
  // Intl menempelkan simbol tanpa spasi; dipisahkan agar sesuai kebiasaan tulis.
  return rupiahFormatter.format(nilai).replace(/^Rp\s?/, 'Rp ');
}

/** `1500000` menjadi `1,5 jt`, untuk label grafik yang sempit. */
export function rupiahRingkas(nilai: number): string {
  if (nilai >= 1_000_000) {
    return `${(nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  }

  if (nilai >= 1_000) {
    return `${(nilai / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
  }

  return String(nilai);
}

/** Memecah `YYYY-MM-DD` menjadi angkanya, tanpa melewati zona waktu. */
function pecahTanggal(tanggal: TanggalISO): [number, number, number] {
  const [tahun, bulan, hari] = tanggal.split('-').map(Number);
  return [tahun, bulan, hari];
}

/** `2026-05-24` menjadi `24 Mei 2026`. */
export function tanggalPanjang(tanggal: TanggalISO): string {
  const [tahun, bulan, hari] = pecahTanggal(tanggal);
  return `${hari} ${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

/** `2026-05-24` menjadi `24 Mei`, untuk ruang yang sempit. */
export function tanggalPendek(tanggal: TanggalISO): string {
  const [, bulan, hari] = pecahTanggal(tanggal);
  return `${hari} ${NAMA_BULAN[bulan - 1]}`;
}

/** `2026-05-24` menjadi `Minggu, 24 Mei 2026`. */
export function tanggalDenganHari(tanggal: TanggalISO): string {
  const [tahun, bulan, hari] = pecahTanggal(tanggal);
  const namaHari = NAMA_HARI[new Date(Date.UTC(tahun, bulan - 1, hari)).getUTCDay()];
  return `${namaHari}, ${hari} ${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

/** `24 Mei 2026 • 09:00–12:00`, memakai tanda pisah en dash. */
export function tanggalDanJam(
  tanggal: TanggalISO,
  jamMulai: Jam,
  jamSelesai: Jam,
): string {
  return `${tanggalPanjang(tanggal)} • ${jamMulai}–${jamSelesai}`;
}

/** Nama bulan dan tahun, `Mei 2026`. */
export function namaBulan(bulan: number, tahun: number): string {
  return `${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

export const DAFTAR_BULAN = NAMA_BULAN.map((nama, i) => ({
  nilai: i + 1,
  nama,
}));

/** Waktu penuh dari backend menjadi `24 Mei 2026 • 09.02` dalam WIB. */
export function waktuLengkap(waktu: WaktuISO): string {
  const d = new Date(waktu);

  const tanggal = new Intl.DateTimeFormat('id-ID', {
    timeZone: ZONA_WIB,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

  const jam = new Intl.DateTimeFormat('id-ID', {
    timeZone: ZONA_WIB,
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);

  return `${tanggal} • ${jam}`;
}

/** Hari ini menurut WIB, sebagai `YYYY-MM-DD`. */
export function hariIniWib(): TanggalISO {
  // Format en-CA menghasilkan YYYY-MM-DD, dan timeZone memastikan harinya WIB
  // meski peramban pengguna berada di zona lain.
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_WIB }).format(
    new Date(),
  );
}

/** Jam sekarang menurut WIB, sebagai `HH:mm`. */
export function jamSekarangWib(): Jam {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA_WIB,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

/** Membandingkan dua tanggal polos tanpa membuat objek Date. */
export function bandingkanTanggal(a: TanggalISO, b: TanggalISO): number {
  // Format YYYY-MM-DD selalu dua digit, sehingga urutan teks sama dengan urutan
  // waktu. Aturan yang sama dipakai backend untuk membandingkan jam.
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Inisial untuk placeholder foto, misalnya `Budi Raharjo` menjadi `BR`. */
export function inisial(nama: string): string {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? '')
    .join('');
}
