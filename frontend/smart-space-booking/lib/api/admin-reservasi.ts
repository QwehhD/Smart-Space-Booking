import { apiGet, apiPatch, apiPost, headerToken, mintaDenganPesan } from '@/lib/api/client';
import type { ReservasiAdmin, StatusReservasi } from '@/types/entities';

/**
 * Filter yang benar-benar diterima backend.
 *
 * Tidak ada parameter pencarian kode booking maupun nama member, sehingga
 * pencarian semacam itu disaring di sisi klien dari data yang sudah dimuat.
 */
export interface FilterReservasiAdmin {
  month?: number;
  year?: number;
  status?: StatusReservasi;
  id_space?: number;
  tanggal?: string;
}

export interface HasilUbahStatus {
  id: number;
  status: StatusReservasi;
  updated_at: string;
}

export interface HasilCheckIn {
  id: number;
  status: StatusReservasi;
  check_in_time: string;
}

export interface HasilCheckOut {
  id: number;
  status: StatusReservasi;
  check_out_time: string;
}

export const daftarReservasiAdmin = (
  filter: FilterReservasiAdmin = {},
  token?: string,
) =>
  apiGet<ReservasiAdmin[]>('/admin/reservasi', {
    ...headerToken(token),
    params: filter,
  });

/**
 * Pesan suksesnya memuat status baru, misalnya "Status reservasi berhasil
 * diperbarui menjadi disetujui", jadi ikut dikembalikan untuk ditampilkan.
 */
export const ubahStatusReservasi = (id: number, status: StatusReservasi) =>
  mintaDenganPesan<HasilUbahStatus>({
    method: 'PATCH',
    url: `/admin/reservasi/${id}/status`,
    data: { status },
  });

export const checkIn = (id: number) =>
  apiPost<HasilCheckIn>(`/admin/reservasi/${id}/check-in`);

export const checkOut = (id: number) =>
  apiPost<HasilCheckOut>(`/admin/reservasi/${id}/check-out`);

/** Disediakan agar pemanggil tidak perlu mengimpor apiPatch sendiri. */
export const batalkanOlehAdmin = (id: number) =>
  apiPatch<HasilUbahStatus>(`/admin/reservasi/${id}/status`, {
    status: 'dibatalkan' satisfies StatusReservasi,
  });
