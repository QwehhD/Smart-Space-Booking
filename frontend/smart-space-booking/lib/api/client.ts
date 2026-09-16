import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { COOKIE_TOKEN } from '@/lib/constants';
import { ApiError } from '@/lib/api/error';
import type { ApiEnvelope, ApiFailure } from '@/types/api';

/**
 * Satu-satunya jalan keluar ke backend.
 *
 * `NEXT_PUBLIC_API_URL` sudah memuat awalan `/api`, jadi dipakai apa adanya
 * sebagai baseURL dan path pada tiap fungsi domain ditulis tanpa awalan itu.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

/**
 * App key milik akun App Maker. Backend mengisolasi seluruh data berdasarkan key
 * ini; bila kosong, backend memakai maker bawaan sehingga aplikasi tetap berjalan
 * tanpa konfigurasi apa pun.
 */
const APP_KEY = process.env.NEXT_PUBLIC_APP_KEY?.trim();

export const api = axios.create({ baseURL: BASE_URL });

/** Membaca token sesi dari cookie saat berjalan di peramban. */
function tokenDariCookie(): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const cocok = document.cookie
    .split('; ')
    .find((bagian) => bagian.startsWith(`${COOKIE_TOKEN}=`));

  return cocok ? decodeURIComponent(cocok.slice(COOKIE_TOKEN.length + 1)) : undefined;
}

api.interceptors.request.use((config) => {
  if (APP_KEY) {
    config.headers['x-maker-key'] = APP_KEY;
  }

  // Header yang sudah diisi pemanggil tidak ditimpa, sehingga Server Component
  // dapat menyuntikkan tokennya sendiri dari cookie milik request tersebut.
  if (!config.headers.Authorization) {
    const token = tokenDariCookie();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Biarkan peramban yang menentukan Content-Type untuk unggahan berkas, karena
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

/**
 * Sama seperti `minta`, tetapi ikut mengembalikan pesan sukses dari backend
 * untuk ditampilkan sebagai notifikasi. Dipakai pada aksi yang pesannya bermakna,
 * misalnya perubahan status reservasi yang menyebutkan status barunya.
 */
export async function mintaDenganPesan<T>(
  config: AxiosRequestConfig,
): Promise<{ data: T; message: string }> {
  const response = await api.request<ApiEnvelope<T>>(config);
  const body = response.data;

  if (!body.status) {
    throw new ApiError(body.message, body.statusCode, body.errors ?? []);
  }

  return { data: body.data, message: body.message };
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

/**
 * Header Authorization untuk pemanggilan dari Server Component, yang tidak dapat
 * membaca `document.cookie`. Tokennya diambil pemanggil dari `cookies()`.
 */
export const headerToken = (token?: string): AxiosRequestConfig =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};
