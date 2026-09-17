import { z } from 'zod';

/**
 * Aturan form pemesanan.
 *
 * Batasannya disalin dari `CreateReservasiDto` di backend. Yang tidak dapat
 * diperiksa di sini adalah ketersediaan jadwal dan keabsahan promo; keduanya
 * ditanyakan ke backend lebih dulu lewat endpoint pengecekan, sebelum pemesanan
 * dikirim.
 */

const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const JAM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Memastikan tanggal benar-benar ada pada kalender, seperti validator backend. */
function tanggalWujud(nilai: string): boolean {
  if (!TANGGAL_REGEX.test(nilai)) {
    return false;
  }

  const [tahun, bulan, hari] = nilai.split('-').map(Number);
  const tanggal = new Date(Date.UTC(tahun, bulan - 1, hari));

  return (
    tanggal.getUTCFullYear() === tahun &&
    tanggal.getUTCMonth() === bulan - 1 &&
    tanggal.getUTCDate() === hari
  );
}

export const skemaReservasi = z.object({
  tanggal_reservasi: z
    .string()
    .min(1, 'Tanggal wajib dipilih')
    .refine(tanggalWujud, 'Tanggal tidak valid'),
  jam_mulai: z
    .string()
    .min(1, 'Jam mulai wajib dipilih')
    .regex(JAM_REGEX, 'Format jam tidak valid'),
  durasi_jam: z
    .number()
    .int('Durasi harus bilangan bulat jam')
    .min(1, 'Durasi minimal 1 jam')
    .max(24, 'Durasi maksimal 24 jam'),
});

export type NilaiReservasi = z.infer<typeof skemaReservasi>;
