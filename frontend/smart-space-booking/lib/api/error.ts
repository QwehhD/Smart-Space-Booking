import type { ApiFieldError } from '@/types/api';

/**
 * Kesalahan yang berasal dari backend, sudah dinormalkan sehingga komponen tidak
 * perlu tahu bentuk error axios maupun bentuk amplop response.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly fieldErrors: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Token tidak ada, kedaluwarsa, atau ditolak: pemakai perlu login ulang. */
  get perluLoginUlang(): boolean {
    return this.statusCode === 401;
  }

  /** Sudah login, tetapi rolenya tidak berhak atas tindakan ini. */
  get tidakBerhak(): boolean {
    return this.statusCode === 403;
  }

  get tidakDitemukan(): boolean {
    return this.statusCode === 404;
  }

  /** Gagal menghubungi server sama sekali, bukan penolakan dari backend. */
  get gagalTerhubung(): boolean {
    return this.statusCode === 0;
  }

  /** Pesan validasi untuk satu field, siap dipasang di bawah input form. */
  pesanUntuk(field: string): string | undefined {
    return this.fieldErrors.find((e) => e.field === field)?.messages[0];
  }
}

/** Bentuk minimal `setError` dari react-hook-form yang dibutuhkan di sini. */
type PemasangError = (
  field: string,
  error: { type: string; message: string },
) => void;

/**
 * Memindahkan rincian validasi backend ke field form yang sesuai.
 *
 * Mengembalikan true bila ada yang terpasang, sehingga pemanggilnya dapat
 * memutuskan perlu tidaknya menampilkan toast: kesalahan yang sudah terlihat di
 * bawah fieldnya tidak perlu diulang sebagai notifikasi.
 */
export function applyFieldErrors(
  error: unknown,
  setError: PemasangError,
  fieldDikenal?: readonly string[],
): boolean {
  if (!(error instanceof ApiError) || error.fieldErrors.length === 0) {
    return false;
  }

  let terpasang = false;

  for (const { field, messages } of error.fieldErrors) {
    if (fieldDikenal && !fieldDikenal.includes(field)) {
      continue;
    }

    setError(field, { type: 'server', message: messages[0] });
    terpasang = true;
  }

  return terpasang;
}
