export const BCRYPT_SALT_ROUNDS = 10;

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
export const TELP_REGEX = /^[0-9+\-\s]+$/;
export const JAM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const KODE_PROMO_REGEX = /^[A-Z0-9]+$/;

/**
 * Nama berkas hasil unggahan: huruf, angka, titik, garis bawah, dan strip saja.
 * Tanpa garis miring maupun titik ganda, sehingga nilai kiriman tidak dapat
 * menyelipkan komponen path ke dalam URL foto yang dibentuk server.
 */
export const NAMA_BERKAS_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;

/**
 * bcrypt hanya membaca 72 byte pertama, sehingga password yang lebih panjang
 * akan diam-diam terpotong dan dua password berbeda dapat dianggap sama.
 */
export const PASSWORD_MAKS = 72;

export const PESAN_VALIDASI = {
  USERNAME_FORMAT:
    'Username hanya boleh berisi huruf, angka, titik, dan garis bawah',
  TELP_FORMAT: 'Nomor telepon hanya boleh berisi angka, spasi, +, dan -',
  JAM_FORMAT: 'Format jam harus HH:mm, contoh 09:00',
  TANGGAL_FORMAT: 'Format tanggal harus YYYY-MM-DD, contoh 2026-08-30',
  TANGGAL_WUJUD:
    'Tanggal harus benar-benar ada pada kalender dan berformat YYYY-MM-DD, contoh 2026-08-30',
  NAMA_BERKAS_FORMAT:
    'Nama berkas foto hanya boleh berisi huruf, angka, titik, garis bawah, dan strip',
  PASSWORD_PANJANG: `Password maksimal ${PASSWORD_MAKS} karakter`,
} as const;
