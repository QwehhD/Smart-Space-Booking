export const DEFAULT_SUCCESS_MESSAGE = 'Berhasil memproses permintaan';
export const DEFAULT_ERROR_MESSAGE = 'Terjadi kesalahan pada server';

export const PRISMA_ERROR_MESSAGE = {
  P2002: 'Data sudah terdaftar',
  P2003: 'Data masih digunakan oleh data lain',
  P2025: 'Data tidak ditemukan',
} as const;

/**
 * Terjemahan pesan kegagalan unggahan berkas.
 *
 * NestJS sudah mengubah error multer menjadi HttpException berbahasa Inggris
 * sebelum sampai ke exception filter, sehingga yang dicocokkan adalah pesannya,
 * bukan kelas errornya. Pesan LIMIT_UNEXPECTED_FILE disusul nama field oleh
 * NestJS, jadi pencocokannya memakai awalan kalimat.
 */
export const UPLOAD_ERROR_MESSAGE: Record<string, string> = {
  'File too large': 'Ukuran berkas melebihi batas yang diizinkan!',
  'Too many files': 'Hanya satu berkas yang dapat diunggah sekaligus!',
  'Too many parts': 'Data yang dikirim terlalu banyak bagiannya!',
  'Unexpected field': 'Berkas harus dikirim pada field bernama "file"!',
  'Field name missing': 'Nama field pada form data tidak boleh kosong!',
  'Multipart: Boundary not found':
    'Format multipart tidak valid. Jangan menetapkan Content-Type sendiri.',
};
