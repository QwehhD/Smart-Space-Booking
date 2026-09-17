import { ZONA_WIB } from '@/lib/format';
import type { WaktuISO } from '@/types/entities';

/**
 * Jembatan antara input `datetime-local` dan waktu ISO yang dipakai backend.
 *
 * Input `datetime-local` tidak mengenal zona waktu: nilainya `YYYY-MM-DDTHH:mm`
 * apa adanya. Sementara itu seluruh masa berlaku promo disimpan backend sebagai
 * waktu penuh ISO 8601. Tanpa penerjemahan yang sengaja, peramban yang zonanya
 * bukan WIB akan menampilkan dan mengirim jam yang berbeda dari yang dimaksud
 * pengelola.
 *
 * Karena itu kedua arahnya dipatok ke WIB: nilai yang diketik selalu dibaca
 * sebagai waktu WIB, dan nilai dari backend selalu ditampilkan dalam WIB.
 */

/** Selisih WIB terhadap UTC. Indonesia bagian barat tidak mengenal DST. */
const OFFSET_WIB = '+07:00';

/** `2026-08-01T00:00` yang dimaksud sebagai WIB menjadi ISO 8601 bertzona. */
export function lokalKeIso(lokal: string): WaktuISO {
  // Input datetime-local dapat menyertakan detik bila pengguna mengetiknya;
  // panjangnya dinormalkan supaya bentuk hasilnya selalu sama.
  const tanpaDetik = lokal.slice(0, 16);
  return new Date(`${tanpaDetik}:00${OFFSET_WIB}`).toISOString();
}

/** Kebalikannya: waktu ISO dari backend menjadi isian `datetime-local` WIB. */
export function isoKeLokal(iso: WaktuISO): string {
  const bagian = new Intl.DateTimeFormat('sv-SE', {
    timeZone: ZONA_WIB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));

  // Format sv-SE menghasilkan `2026-08-01 00:00`; input butuh pemisah `T`.
  return bagian.replace(' ', 'T');
}

/** Apakah promo sedang berlaku sekarang, dinilai dari rentang tanggalnya. */
export function sedangBerlaku(awal: WaktuISO, akhir: WaktuISO): boolean {
  const sekarang = Date.now();
  return Date.parse(awal) <= sekarang && sekarang <= Date.parse(akhir);
}

/** Apakah masa berlakunya sudah lewat. */
export function sudahLewat(akhir: WaktuISO): boolean {
  return Date.parse(akhir) < Date.now();
}
