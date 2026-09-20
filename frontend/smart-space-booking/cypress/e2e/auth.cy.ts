/// <reference types="cypress" />

/**
 * Masuk dan proteksi rute.
 *
 * Spec ini sengaja memakai form seperti yang dilakukan pengguna, bukan jalan
 * pintas lewat API, karena justru form inilah yang sedang diuji.
 */
describe('Autentikasi', () => {
  it('member dapat masuk lewat form dan diantar ke katalog', () => {
    cy.visit('/login');
    cy.potret('Halaman masuk member');

    cy.get('input[name="username"]').type('budi');
    cy.get('input[name="password"]').type('Secret123!');
    cy.potret('Form masuk terisi');

    cy.contains('button', 'Masuk').click();

    cy.location('pathname').should('eq', '/spaces');
    cy.contains('Ketersediaan Space').should('exist');
    cy.potret('Katalog setelah berhasil masuk');
  });

  it('admin space dapat masuk dan diantar ke dashboard', () => {
    cy.visit('/admin/login');

    cy.get('input[name="username"]').type('admin_moklet');
    cy.get('input[name="password"]').type('Admin123!');
    cy.contains('button', 'Masuk').click();

    cy.location('pathname').should('eq', '/admin/dashboard');
    cy.contains('Moklet Hub Coworking Space').should('exist');
    cy.potret('Dashboard pengelola');
  });

  it('menolak password yang salah dan tetap di halaman masuk', () => {
    cy.visit('/login');

    cy.get('input[name="username"]').type('budi');
    cy.get('input[name="password"]').type('SalahBanget123!');
    cy.contains('button', 'Masuk').click();

    // Pesannya muncul sebagai notifikasi sonner di dalam portal tersendiri.
    cy.contains('[data-sonner-toast]', 'Username atau Password salah!').should(
      'exist',
    );
    cy.potret('Penolakan password salah');
    cy.location('pathname').should('eq', '/login');
  });

  /**
   * Proteksi rute ditangani `proxy.ts`. Yang diperiksa di sini bukan keabsahan
   * token, melainkan bahwa halaman yang salah tidak sempat tampil.
   */
  it('mengalihkan tamu yang membuka halaman terproteksi ke halaman masuk', () => {
    cy.visit('/reservasi');
    cy.location('pathname').should('eq', '/login');
  });

  it('mengalihkan member yang membuka panel pengelola', () => {
    cy.masukSebagai('budi', 'Secret123!');

    cy.visit('/admin/dashboard');
    cy.location('pathname').should('eq', '/spaces');
  });

  /**
   * Beranda hanya berguna bagi pengunjung yang belum punya sesi. Yang sudah
   * masuk langsung diantar ke beranda miliknya masing-masing.
   */
  it('menyambut tamu di beranda dengan ajakan yang jelas', () => {
    cy.visit('/');

    cy.contains('ruang kerja').should('exist');
    cy.contains('a', 'Jelajahi Ruangan').should('have.attr', 'href', '/spaces');
    cy.contains('a', 'Masuk ke panel pengelola').should(
      'have.attr',
      'href',
      '/admin/login',
    );
    cy.potret('Beranda untuk pengunjung');
  });

  it('mengantar member dari beranda ke katalog', () => {
    cy.masukSebagai('budi', 'Secret123!');
    cy.visit('/');
    cy.location('pathname').should('eq', '/spaces');
  });

  it('mengantar pengelola dari beranda ke dashboard', () => {
    cy.masukSebagai('admin_moklet', 'Admin123!');
    cy.visit('/');
    cy.location('pathname').should('eq', '/admin/dashboard');
  });

  it('mengalihkan pengguna yang sudah masuk dari halaman masuk', () => {
    cy.masukSebagai('budi', 'Secret123!');

    cy.visit('/login');
    cy.location('pathname').should('eq', '/spaces');
  });
});
