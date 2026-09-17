import { hariIniWib } from '@/lib/format';

/**
 * Membaca bulan dan tahun dari parameter URL.
 *
 * Nilai yang kosong atau tidak masuk akal jatuh ke bulan berjalan menurut WIB,
 * sama seperti bawaan backend ketika parameternya tidak dikirim.
 */
export function bacaBulanTahun(
  month: string | string[] | undefined,
  year: string | string[] | undefined,
): { month: number; year: number } {
  const [tahunIni, bulanIni] = hariIniWib().split('-').map(Number);

  const m = Number(typeof month === 'string' ? month : NaN);
  const y = Number(typeof year === 'string' ? year : NaN);

  return {
    month: Number.isInteger(m) && m >= 1 && m <= 12 ? m : bulanIni,
    year: Number.isInteger(y) && y >= 2000 && y <= 2100 ? y : tahunIni,
  };
}
