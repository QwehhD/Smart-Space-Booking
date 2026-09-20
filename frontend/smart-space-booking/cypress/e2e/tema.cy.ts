/// <reference types="cypress" />

/**
 * Tema terang dan gelap.
 *
 * Yang diperiksa bukan sekadar ada tidaknya kelas `dark`, melainkan bahwa warna
 * yang benar-benar dihitung peramban ikut berubah. Tanpa itu, kesalahan seperti
 * token yang tidak terdefinisi pada salah satu tema akan lolos.
 */
describe('Tema', () => {
  /**
   * Kecerahan latar, 0 sampai 100.
   *
   * Chrome melaporkan warna yang berasal dari `oklch` sebagai `lab(L …)`, bukan
   * `rgb(…)`, sehingga angka pertamanya sudah berupa kecerahan. Format `rgb`
   * tetap ditangani agar pengujian tidak bergantung pada cara peramban
   * menuliskan warnanya.
   */
  const kecerahan = (warna: string): number => {
    const angka = (warna.match(/[\d.]+/g) ?? []).map(Number);

    if (warna.startsWith('lab') || warna.startsWith('oklab')) {
      return angka[0];
    }

    // rgb: rata-rata ketiga kanal, diskalakan ke 0-100.
    return ((angka[0] + angka[1] + angka[2]) / 3 / 255) * 100;
  };

  /** Memasang pilihan tema sebelum halaman dimuat, seperti kunjungan berikutnya. */
  const denganTema = (tema: string, path: string) =>
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('theme', tema);
      },
    });

  it('menerapkan tema gelap dan warnanya benar-benar berubah', () => {
    cy.masukSebagai('budi', 'Secret123!');
    denganTema('dark', '/spaces');
    cy.wait(500);

    cy.get('html').should('have.class', 'dark');
    cy.get('body').then(($b) => {
      const bg = getComputedStyle($b[0]).backgroundColor;
      expect(kecerahan(bg), `latar gelap, bg=${bg}`).to.be.lessThan(30);
    });
    cy.potret('Katalog dalam tema gelap');
  });

  it('menerapkan tema terang', () => {
    cy.masukSebagai('budi', 'Secret123!');
    denganTema('light', '/spaces');
    cy.wait(500);

    cy.get('html').should('not.have.class', 'dark');
    cy.get('body').then(($b) => {
      const bg = getComputedStyle($b[0]).backgroundColor;
      expect(kecerahan(bg), `latar terang, bg=${bg}`).to.be.greaterThan(90);
    });
  });

  it('pengelola juga mendapat tema gelap', () => {
    cy.masukSebagai('admin_moklet', 'Admin123!');
    denganTema('dark', '/admin/dashboard');
    cy.wait(500);

    cy.get('html').should('have.class', 'dark');
    cy.potret('Dashboard pengelola dalam tema gelap');
  });

  it('pilihan tema tersimpan dan bertahan antar halaman', () => {
    cy.masukSebagai('budi', 'Secret123!');
    denganTema('dark', '/spaces');
    cy.wait(400);

    cy.visit('/akun');
    cy.wait(400);
    cy.get('html').should('have.class', 'dark');
  });
});
