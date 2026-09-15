export const DEFAULT_SUCCESS_MESSAGE = 'Berhasil memproses permintaan';
export const DEFAULT_ERROR_MESSAGE = 'Terjadi kesalahan pada server';

export const PRISMA_ERROR_MESSAGE = {
  P2002: 'Data sudah terdaftar',
  P2003: 'Data masih digunakan oleh data lain',
  P2025: 'Data tidak ditemukan',
} as const;
