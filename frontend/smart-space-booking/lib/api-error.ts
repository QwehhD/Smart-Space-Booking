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

  /** Pesan validasi untuk satu field, siap dipasang di bawah input form. */
  pesanUntuk(field: string): string | undefined {
    return this.fieldErrors.find((e) => e.field === field)?.messages[0];
  }
}
