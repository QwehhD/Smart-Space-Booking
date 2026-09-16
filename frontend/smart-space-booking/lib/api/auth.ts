import { apiGet, apiPost, headerToken } from '@/lib/api/client';
import type {
  HasilLogin,
  HasilRegistrasi,
  ProfilPengguna,
} from '@/types/entities';

export interface PayloadLogin {
  username: string;
  password: string;
}

export interface PayloadRegisterMember {
  username: string;
  password: string;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
}

export interface PayloadRegisterAdmin {
  username: string;
  password: string;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
  alamat?: string;
  deskripsi?: string;
  foto?: string;
}

export const login = (payload: PayloadLogin) =>
  apiPost<HasilLogin>('/auth/login', payload);

export const registerMember = (payload: PayloadRegisterMember) =>
  apiPost<HasilRegistrasi>('/auth/register/member', payload);

export const registerAdminSpace = (payload: PayloadRegisterAdmin) =>
  apiPost<HasilRegistrasi>('/auth/register/admin-space', payload);

/** Token boleh disuntikkan agar dapat dipanggil dari Server Component. */
export const ambilProfil = (token?: string) =>
  apiGet<ProfilPengguna>('/auth/profile', headerToken(token));
