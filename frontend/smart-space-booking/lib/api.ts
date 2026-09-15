import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { ApiError } from '@/lib/api-error';
import type { ApiEnvelope, ApiFailure } from '@/types/api';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * App key milik akun App Maker. Backend mengisolasi seluruh data berdasarkan key
 * ini; bila tidak dikirim, backend memakai maker bawaan, sehingga aplikasi tetap
 * berjalan walau variabel ini belum diisi.
 */
const MAKER_KEY = process.env.NEXT_PUBLIC_MAKER_KEY;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: MAKER_KEY ? { 'x-maker-key': MAKER_KEY } : undefined,
});

/**
 * Pembaca token yang dapat diganti, karena penyimpanan token berbeda antara
 * browser dan server. Modul ini sengaja tidak menyentuh `localStorage` langsung
 * supaya tetap aman diimpor dari Server Component.
 */
let bacaToken: () => string | undefined | null = () => undefined;

export function setPembacaToken(pembaca: typeof bacaToken): void {
  bacaToken = pembaca;
}

api.interceptors.request.use((config) => {
  const token = bacaToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Biarkan browser yang menentukan Content-Type untuk unggahan berkas, karena
  // batas multipart hanya dapat disusun olehnya.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    const body = error.response?.data;

    // Backend selalu membalas dengan amplop yang sama, jadi pesannya dapat
    // dipakai langsung. Kegagalan tanpa body berarti jaringan atau server mati.
    if (body?.message) {
      throw new ApiError(body.message, body.statusCode, body.errors ?? []);
    }

    throw new ApiError(
      'Tidak dapat terhubung ke server. Periksa koneksi Anda.',
      error.response?.status ?? 0,
    );
  },
);

/** Membuka amplop response dan mengembalikan `data`-nya saja. */
async function minta<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<ApiEnvelope<T>>(config);
  const body = response.data;

  if (!body.status) {
    throw new ApiError(body.message, body.statusCode, body.errors ?? []);
  }

  return body.data;
}

export const apiGet = <T>(url: string, config?: AxiosRequestConfig) =>
  minta<T>({ ...config, method: 'GET', url });

export const apiPost = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => minta<T>({ ...config, method: 'POST', url, data });

export const apiPut = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => minta<T>({ ...config, method: 'PUT', url, data });

export const apiPatch = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
) => minta<T>({ ...config, method: 'PATCH', url, data });

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig) =>
  minta<T>({ ...config, method: 'DELETE', url });
