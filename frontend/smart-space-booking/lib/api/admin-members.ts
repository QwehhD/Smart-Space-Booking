import { apiDelete, apiGet, apiPost, apiPut, headerToken } from '@/lib/api/client';
import type { Member } from '@/types/entities';
import type { HasilHapus } from '@/lib/api/admin-spaces';

export interface PayloadMemberBaru {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
}

/**
 * Username tidak dapat diubah backend, dan password bersifat opsional saat
 * mengubah: bila dikirim, backend memperlakukannya sebagai reset kata sandi.
 */
export type PayloadMemberUbah = Partial<Omit<PayloadMemberBaru, 'username'>>;

export const daftarMember = (search?: string, token?: string) =>
  apiGet<Member[]>('/admin/members', {
    ...headerToken(token),
    params: search ? { search } : undefined,
  });

export const detailMember = (id: number, token?: string) =>
  apiGet<Member>(`/admin/members/${id}`, headerToken(token));

export const buatMember = (payload: PayloadMemberBaru) =>
  apiPost<Member>('/admin/members', payload);

export const perbaruiMember = (id: number, payload: PayloadMemberUbah) =>
  apiPut<Member>(`/admin/members/${id}`, payload);

export const hapusMember = (id: number) =>
  apiDelete<HasilHapus>(`/admin/members/${id}`);
