/**
 * Bentuk amplop response backend. Setiap endpoint, sukses maupun gagal, selalu
 * membalas dengan struktur ini, sehingga cukup ditangani sekali di satu tempat.
 */
export interface ApiSuccess<T> {
  status: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Rincian kesalahan validasi per field, dipakai untuk menandai input di form. */
export interface ApiFieldError {
  field: string;
  messages: string[];
}

export interface ApiFailure {
  status: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  errors?: ApiFieldError[];
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
