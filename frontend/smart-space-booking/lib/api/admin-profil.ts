import { apiGet, apiPut, headerToken } from '@/lib/api/client';
import type { SpaceOwner } from '@/types/entities';

export interface PayloadProfilLokasi {
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
  alamat?: string;
  deskripsi?: string;
  foto?: string;
}

export const ambilProfilLokasi = (token?: string) =>
  apiGet<SpaceOwner>('/admin/profile', headerToken(token));

/**
 * Pembaruan bersifat parsial: field opsional yang tidak dikirim dibiarkan apa
 * adanya oleh backend, bukan dikosongkan.
 */
export const simpanProfilLokasi = (payload: PayloadProfilLokasi) =>
  apiPut<SpaceOwner>('/admin/profile', payload);
