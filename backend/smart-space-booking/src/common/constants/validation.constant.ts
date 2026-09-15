export const BCRYPT_SALT_ROUNDS = 10;

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
export const TELP_REGEX = /^[0-9+\-\s]+$/;
export const JAM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const KODE_PROMO_REGEX = /^[A-Z0-9]+$/;

export const PESAN_VALIDASI = {
  USERNAME_FORMAT:
    'Username hanya boleh berisi huruf, angka, titik, dan garis bawah',
  TELP_FORMAT: 'Nomor telepon hanya boleh berisi angka, spasi, +, dan -',
  JAM_FORMAT: 'Format jam harus HH:mm, contoh 09:00',
  TANGGAL_FORMAT: 'Format tanggal harus YYYY-MM-DD, contoh 2026-08-30',
} as const;
