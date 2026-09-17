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

/**
 * Memindahkan rincian validasi backend ke field form yang sesuai.
 *
 * Tipenya generik terhadap nama field form, sehingga hanya field yang benar-benar
 * ada pada form itu yang dapat dipasangi error. Nama field dari backend berupa
 * teks biasa, jadi `fieldDikenal` dipakai sebagai penyaring sekaligus bukti bahwa
 * nama tersebut memang milik form ini.
 *
 * Mengembalikan true bila ada yang terpasang, sehingga pemanggilnya dapat
 * memutuskan perlu tidaknya menampilkan toast: kesalahan yang sudah terlihat di
 * bawah fieldnya tidak perlu diulang sebagai notifikasi.
 */
export function applyFieldErrors<TField extends string>(
  error: unknown,
  setError: (field: TField, kesalahan: { type: string; message: string }) => void,
  fieldDikenal: readonly TField[],
): boolean {
  if (!(error instanceof ApiError) || error.fieldErrors.length === 0) {
    return false;
  }

  let terpasang = false;

  for (const { field, messages } of error.fieldErrors) {
    // Penyaringan ini yang membuat penyempitan tipe di bawahnya aman: field yang
    // tidak ada pada daftar tidak pernah diteruskan ke form.
    if (!(fieldDikenal as readonly string[]).includes(field)) {
      continue;
    }

    setError(field as TField, { type: 'server', message: messages[0] });
    terpasang = true;
  }

  return terpasang;
}
