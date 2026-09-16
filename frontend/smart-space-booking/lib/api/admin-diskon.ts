import { apiDelete, apiGet, apiPost, apiPut, headerToken } from '@/lib/api/client';
import type { Diskon } from '@/types/entities';
import type { HasilHapus } from '@/lib/api/admin-spaces';

export interface PayloadDiskon {
  nama_diskon: string;
  persentase_diskon: number;
  /** Waktu penuh ISO 8601; form datetime-local WIB dikonversi lebih dulu. */
  tanggal_awal: string;
  tanggal_akhir: string;
}

export const daftarDiskonAdmin = (token?: string) =>
  apiGet<Diskon[]>('/admin/diskon', headerToken(token));

export const detailDiskonAdmin = (id: number, token?: string) =>
  apiGet<Diskon>(`/admin/diskon/${id}`, headerToken(token));

export const buatDiskon = (payload: PayloadDiskon) =>
  apiPost<Diskon>('/admin/diskon', payload);

export const perbaruiDiskon = (id: number, payload: Partial<PayloadDiskon>) =>
  apiPut<Diskon>(`/admin/diskon/${id}`, payload);

export const hapusDiskon = (id: number) =>
  apiDelete<HasilHapus>(`/admin/diskon/${id}`);
