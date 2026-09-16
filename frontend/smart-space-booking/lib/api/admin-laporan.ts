import { apiGet, headerToken } from '@/lib/api/client';
import type { LaporanBulanan } from '@/types/entities';

/**
 * Rekap pendapatan satu bulan, termasuk `pendapatan_per_hari` yang jumlahnya
 * sama dengan `realisasi_pendapatan_bersih`.
 *
 * Endpoint `/admin/reports/income` sengaja tidak dibungkus: isinya hanya ringkasan
 * dari laporan yang sama, dan halaman laporan selalu membutuhkan rincian penuhnya.
 */
export const laporanBulanan = (month: number, year: number, token?: string) =>
  apiGet<LaporanBulanan>('/admin/reports/monthly', {
    ...headerToken(token),
    params: { month, year },
  });
