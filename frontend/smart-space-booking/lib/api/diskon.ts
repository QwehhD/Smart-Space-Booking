import { apiGet, apiPost, headerToken } from '@/lib/api/client';
import type { Diskon, DiskonTervalidasi } from '@/types/entities';

/**
 * Promo yang sedang aktif.
 *
 * `id_space` menyaring hanya promo milik pengelola space tersebut. Ini penting
 * pada form pemesanan, karena backend menolak promo terbitan pengelola lain.
 */
export const diskonAktif = (idSpace?: number, token?: string) =>
  apiGet<Diskon[]>('/diskon/active', {
    ...headerToken(token),
    params: idSpace ? { id_space: idSpace } : undefined,
  });

export const detailDiskon = (id: number) => apiGet<Diskon>(`/diskon/${id}`);

/** Memeriksa kode yang diketik pengguna, sekaligus kepemilikannya atas space. */
export const periksaPromo = (nama_diskon: string, id_space?: number) =>
  apiPost<DiskonTervalidasi>('/diskon/check', { nama_diskon, id_space });
