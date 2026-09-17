import { hariIniWib, jamSekarangWib } from '@/lib/format';
import { JAM_BUKA, JAM_TUTUP } from '@/lib/constants';
import type { Jam, TanggalISO } from '@/types/entities';

/**
 * Perhitungan pilihan jam dan durasi pada form pemesanan.
 *
 * Aturannya sengaja sama dengan yang ditegakkan backend: jam sewa harus berada
 * di dalam jam operasional, dan satu reservasi tidak boleh melewati tengah malam.
 * Perhitungan di sini hanya membatasi apa yang dapat dipilih pengguna; penolakan
 * sebenarnya tetap dilakukan backend.
 *
 * Jam diperlakukan sebagai teks `HH:mm` yang selalu dua digit, sehingga
 * perbandingan teksnya sama dengan perbandingan waktu, persis seperti di backend.
 */

const MENIT_PER_JAM = 60;

export function jamKeMenit(jam: Jam): number {
  const [h, m] = jam.split(':').map(Number);
  return h * MENIT_PER_JAM + m;
}

export function menitKeJam(menit: number): Jam {
  const h = Math.floor(menit / MENIT_PER_JAM);
  const m = menit % MENIT_PER_JAM;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Jam selesai dari jam mulai dan durasi, tanpa membatasi tengah malam. */
export function hitungJamSelesai(jamMulai: Jam, durasiJam: number): Jam {
  return menitKeJam(jamKeMenit(jamMulai) + durasiJam * MENIT_PER_JAM);
}

/**
 * Pilihan jam mulai yang masuk akal untuk satu tanggal.
 *
 * Jam terakhir yang ditawarkan adalah satu jam sebelum tutup, karena durasi
 * minimalnya satu jam. Bila tanggalnya hari ini, jam yang sudah lewat dibuang
 * supaya pengguna tidak memilih waktu yang mustahil.
 */
export function pilihanJamMulai(
  tanggal: TanggalISO,
  sekarang: { tanggal: TanggalISO; jam: Jam } = {
    tanggal: hariIniWib(),
    jam: jamSekarangWib(),
  },
): Jam[] {
  const awal = jamKeMenit(JAM_BUKA);
  const akhir = jamKeMenit(JAM_TUTUP) - MENIT_PER_JAM;

  const hasil: Jam[] = [];

  for (let menit = awal; menit <= akhir; menit += MENIT_PER_JAM) {
    const jam = menitKeJam(menit);

    // Untuk hari ini, jam yang sudah lewat tidak lagi dapat dipesan.
    if (tanggal === sekarang.tanggal && jam <= sekarang.jam) {
      continue;
    }

    hasil.push(jam);
  }

  return hasil;
}

/**
 * Durasi maksimal dari satu jam mulai, yaitu sisa jam sampai tutup.
 *
 * Mengembalikan 0 bila jam mulainya sudah di luar jam operasional, sehingga
 * pemanggilnya dapat memperlakukan keadaan itu sebagai tidak dapat dipesan.
 */
export function durasiMaksimal(jamMulai: Jam): number {
  const sisa = jamKeMenit(JAM_TUTUP) - jamKeMenit(jamMulai);
  return sisa > 0 ? Math.floor(sisa / MENIT_PER_JAM) : 0;
}

/** Daftar durasi yang dapat dipilih untuk satu jam mulai. */
export function pilihanDurasi(jamMulai: Jam): number[] {
  const maks = durasiMaksimal(jamMulai);
  return Array.from({ length: maks }, (_, i) => i + 1);
}

/** Tanggal paling awal yang boleh dipesan, yaitu hari ini menurut WIB. */
export const tanggalPalingAwal = hariIniWib;

/**
 * Apakah kombinasi jam dan durasi masih berada di dalam jam operasional.
 * Dipakai untuk memeriksa ulang setelah salah satu nilainya berubah.
 */
export function dalamJamOperasional(jamMulai: Jam, durasiJam: number): boolean {
  return (
    jamMulai >= JAM_BUKA && hitungJamSelesai(jamMulai, durasiJam) <= JAM_TUTUP
  );
}
