import { defineConfig } from 'cypress';

/**
 * Pengujian ujung ke ujung di peramban sungguhan.
 *
 * Berbeda dari pengujian Vitest yang menguji logika murni di `lib/`, pengujian
 * di sini menjalankan aplikasi yang benar-benar berjalan beserta backend-nya,
 * sehingga yang diperiksa adalah alur yang dipakai pengguna: mengisi form,
 * menekan tombol, dan melihat hasilnya.
 *
 * Keduanya harus sudah berjalan sebelum `npm run e2e` dipanggil:
 * backend di port 3000 dan frontend di port 3001.
 *
 * Dijalankan di **Chrome**, bukan Electron bawaan Cypress. Electron tidak pernah
 * menyelesaikan batas Suspense milik Next.js: konten yang di-stream tetap
 * tertinggal di dalam `<div hidden>` dan halaman hanya menampilkan kerangka
 * muatnya, sehingga setiap rute yang punya `loading.tsx` terlihat kosong.
 * Di Chrome sungguhan hal itu tidak terjadi. Ini murni perbedaan peramban, bukan
 * gejala pada aplikasinya.
 */
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    specPattern: 'cypress/e2e/**/*.cy.ts',

    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: false,

    // Video dan tangkapan layar dimatikan supaya repositori tidak terisi berkas
    // besar; kegagalan sudah cukup dijelaskan oleh pesan dan jejaknya di konsol.
    video: false,
    screenshotOnRunFailure: false,

    viewportWidth: 1280,
    viewportHeight: 800,

    // Alamat backend dipakai untuk menyiapkan data lewat API, bukan lewat
    // antarmuka, supaya penyiapannya cepat dan tidak ikut gagal ketika yang
    // rusak justru halaman yang sedang diuji.
    //
    // Memakai `expose`, bukan `env`: sejak Cypress 16 `Cypress.env()` dihapus
    // dan diganti `Cypress.expose()` untuk nilai yang memang tidak rahasia.
    expose: {
      apiUrl: 'http://localhost:3000/api',
    },
  },
});
