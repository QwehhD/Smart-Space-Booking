import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Pengujian unit untuk logika murni di `lib/`.
 *
 * Lingkungannya `node`, bukan peramban, karena yang diuji tidak menyentuh DOM
 * sama sekali. Menghindari jsdom membuat pengujiannya berjalan cepat dan
 * konfigurasinya tetap kecil.
 *
 * Zona waktu dipaksa ke UTC, bukan dibiarkan mengikuti mesin yang menjalankan.
 * Sebagian besar fungsi di `lib/` justru bertugas menjaga tanggal tetap benar
 * dalam WIB, sehingga menjalankannya di zona yang sama dengan WIB akan menutupi
 * kesalahan yang hendak dicegah.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    env: { TZ: 'UTC' },
  },
});
