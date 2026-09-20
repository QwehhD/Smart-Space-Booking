/// <reference types="cypress" />

/**
 * Perintah bantu yang dipakai bersama seluruh spec.
 *
 * Masuk ke aplikasi dilakukan lewat API lalu cookienya dipasang langsung, bukan
 * dengan mengisi form login setiap kali. Alasannya dua: pengujian menjadi jauh
 * lebih cepat, dan kegagalan pada halaman login tidak ikut menjatuhkan spec yang
 * sebenarnya menguji hal lain. Form login itu sendiri tetap diuji tersendiri di
 * `auth.cy.ts` lewat antarmuka seperti yang dilakukan pengguna.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Masuk lewat API lalu memasang cookie sesi. */
      masukSebagai(username: string, password: string): Chainable<void>;
      /** Membuat reservasi lewat API dan mengembalikan datanya. */
      buatReservasi(payload: Record<string, unknown>): Chainable<ReservasiBaru>;
      /** Membuat space milik pengelola yang sedang masuk. */
      buatSpace(nama: string): Chainable<number>;
      /** Menghapus space (soft delete di backend). */
      hapusSpace(id: number): Chainable<void>;
      /** Tangkapan layar berdokumentasi, dinomori urut sesuai langkahnya. */
      potret(judul: string): Chainable<void>;
    }
  }
}

export interface ReservasiBaru {
  id: number;
  kode_booking: string;
  total_bayar: number;
}

const COOKIE_TOKEN = 'ssb_token';
const COOKIE_ROLE = 'ssb_role';

/**
 * Sesi di-cache dengan `cy.session()`, bukan login ulang di setiap test.
 *
 * Backend membatasi endpoint auth pada sepuluh percobaan per menit per alamat IP
 * (lihat keputusan 18 di backend). Tanpa cache, satu kali menjalankan suite ini
 * sudah cukup untuk menembus batas itu dan seluruh test sesudahnya gagal dengan
 * 429 — kegagalan yang tidak ada hubungannya dengan yang sedang diuji.
 *
 * `cy.session()` menjalankan login sekali per pengguna lalu memulihkan cookienya
 * dari cache pada test berikutnya, sehingga jumlah permintaan auth tetap sedikit
 * berapa pun banyaknya test.
 */
Cypress.Commands.add('masukSebagai', (username: string, password: string) => {
  cy.session(
    username,
    () => {
      cy.request('POST', `${Cypress.expose('apiUrl')}/auth/login`, {
        username,
        password,
      }).then((res) => {
        const { access_token, role } = res.body.data;
        cy.setCookie(COOKIE_TOKEN, access_token);
        cy.setCookie(COOKIE_ROLE, role);
      });
    },
    {
      validate() {
        // Sesi yang cookienya sudah hilang dianggap tidak sah, sehingga
        // login diulang alih-alih meneruskan sesi kosong.
        cy.getCookie(COOKIE_TOKEN).should('exist');
      },
      cacheAcrossSpecs: true,
    },
  );
});

Cypress.Commands.add('buatReservasi', (payload: Record<string, unknown>) => {
  return cy.getCookie(COOKIE_TOKEN).then((cookie) =>
    cy
      .request({
        method: 'POST',
        url: `${Cypress.expose('apiUrl')}/reservasi`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
        body: payload,
      })
      .then((res) => res.body.data as ReservasiBaru),
  );
});

export {};

/**
 * Space khusus untuk satu kali jalan.
 *
 * Pengujian yang memesan pada tanggal hari ini tidak dapat memakai space seed,
 * karena jadwal yang sudah terpakai tidak pernah bebas lagi dan menjalankan
 * suite untuk kedua kalinya akan gagal dengan "Space tidak tersedia". Dengan
 * membuat space sendiri tiap jalan, jadwalnya selalu kosong, dan space itu
 * dibuang lagi di akhir sehingga katalog kembali seperti semula.
 */
Cypress.Commands.add('buatSpace', (nama: string) => {
  return cy.getCookie(COOKIE_TOKEN).then((cookie) =>
    cy
      .request({
        method: 'POST',
        url: `${Cypress.expose('apiUrl')}/admin/spaces`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
        body: {
          nama_space: nama,
          harga_per_jam: 20_000,
          tipe: 'desk',
          kapasitas: 1,
          deskripsi: 'Space sementara yang dibuat oleh pengujian e2e.',
        },
      })
      .then((res) => res.body.data.id as number),
  );
});

Cypress.Commands.add('hapusSpace', (id: number) => {
  cy.getCookie(COOKIE_TOKEN).then((cookie) => {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.expose('apiUrl')}/admin/spaces/${id}`,
      headers: { Authorization: `Bearer ${cookie?.value}` },
      failOnStatusCode: false,
    });
  });
});

/**
 * Tangkapan layar untuk dokumentasi.
 *
 * Berkasnya dinomori menurut urutan pemanggilan, supaya ketika dibuka berurutan
 * gambarnya menceritakan alurnya dari awal sampai akhir. Tanpa penomoran, urutan
 * berkas mengikuti abjad dan alurnya jadi teracak.
 *
 * Nomornya menerus untuk satu berkas spec, bukan disetel ulang tiap pengujian,
 * karena seluruh gambar dalam satu spec ditaruh Cypress di dalam satu folder
 * yang sama. Penomoran per pengujian akan menghasilkan beberapa berkas bernomor
 * "01" yang lalu terurut menurut judulnya, bukan menurut alurnya.
 */
let langkah = 0;

Cypress.Commands.add('potret', (judul: string) => {
  langkah += 1;
  const nomor = String(langkah).padStart(2, '0');

  // Halaman dibiarkan tenang sejenak supaya animasi masuk dan gambar yang
  // sedang dimuat tidak terpotret setengah jalan.
  cy.wait(250);
  cy.screenshot(`${nomor} ${judul}`, {
    capture: 'viewport',
    overwrite: true,
  });
});
