import { apiGet, apiPatch, apiPost, headerToken } from '@/lib/api/client';
import type {
  ETicket,
  HistoriBulanan,
  ReservasiBaru,
  ReservasiDetail,
  ReservasiRingkas,
  StatusReservasi,
} from '@/types/entities';

export interface PayloadReservasi {
  id_space: number;
  tanggal_reservasi: string;
  jam_mulai: string;
  durasi_jam: number;
  id_diskon?: number;
  kode_promo?: string;
}

export interface HasilBatal {
  id: number;
  status: StatusReservasi;
  updated_at: string;
}

export const buatReservasi = (payload: PayloadReservasi) =>
  apiPost<ReservasiBaru>('/reservasi', payload);

export const reservasiSaya = (token?: string) =>
  apiGet<ReservasiRingkas[]>('/reservasi/my', headerToken(token));

export const historiSaya = (month: number, year: number, token?: string) =>
  apiGet<HistoriBulanan>('/reservasi/my/history', {
    ...headerToken(token),
    params: { month, year },
  });

/** Dapat dibuka member pemiliknya maupun admin lokasinya. */
export const detailReservasi = (id: number, token?: string) =>
  apiGet<ReservasiDetail>(`/reservasi/${id}`, headerToken(token));

export const eTicket = (id: number, token?: string) =>
  apiGet<ETicket>(`/reservasi/${id}/e-ticket`, headerToken(token));

export const batalkanReservasi = (id: number) =>
  apiPatch<HasilBatal>(`/reservasi/${id}/cancel`);
