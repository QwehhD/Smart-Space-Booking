import { apiDelete, apiGet, apiPost, apiPut, headerToken } from '@/lib/api/client';
import type { Space, TipeSpace } from '@/types/entities';

export interface PayloadSpace {
  nama_space: string;
  harga_per_jam: number;
  tipe: TipeSpace;
  kapasitas: number;
  deskripsi: string;
  foto?: string;
}

export interface HasilHapus {
  id: number;
  deleted: true;
}

export const daftarSpaceAdmin = (token?: string) =>
  apiGet<Space[]>('/admin/spaces', headerToken(token));

export const detailSpaceAdmin = (id: number, token?: string) =>
  apiGet<Space>(`/admin/spaces/${id}`, headerToken(token));

export const buatSpace = (payload: PayloadSpace) =>
  apiPost<Space>('/admin/spaces', payload);

/** Seluruh field opsional; yang tidak dikirim tidak diubah. */
export const perbaruiSpace = (id: number, payload: Partial<PayloadSpace>) =>
  apiPut<Space>(`/admin/spaces/${id}`, payload);

/** Penghapusan bersifat soft delete di backend. */
export const hapusSpace = (id: number) =>
  apiDelete<HasilHapus>(`/admin/spaces/${id}`);
