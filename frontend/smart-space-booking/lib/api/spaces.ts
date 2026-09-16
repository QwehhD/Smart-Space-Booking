import { apiGet, headerToken } from '@/lib/api/client';
import type {
  KeteranganTipeSpace,
  Ketersediaan,
  SpacePublik,
  TipeSpace,
} from '@/types/entities';

export interface FilterSpace {
  tipe?: TipeSpace;
  search?: string;
}

export interface ParamKetersediaan {
  id_space: number;
  tanggal: string;
  jam_mulai: string;
  durasi_jam: number;
}

/** Katalog publik. Dipanggil juga dari Server Component tanpa token. */
export const daftarSpace = (filter: FilterSpace = {}, token?: string) =>
  apiGet<SpacePublik[]>('/spaces', { ...headerToken(token), params: filter });

export const detailSpace = (id: number, token?: string) =>
  apiGet<SpacePublik>(`/spaces/${id}`, headerToken(token));

export const tipeSpace = (token?: string) =>
  apiGet<KeteranganTipeSpace[]>('/spaces/types', headerToken(token));

/**
 * Ketersediaan jadwal. Jadwal yang bentrok dibalas 400 oleh backend, bukan
 * `available: false`, sehingga pemanggilnya menangani penolakan itu sebagai
 * ApiError dengan pesan yang sudah siap ditampilkan.
 */
export const cekKetersediaan = (param: ParamKetersediaan) =>
  apiGet<Ketersediaan>('/spaces/availability', { params: param });
