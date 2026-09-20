/// <reference types="cypress" />

/**
 * Alur pemesanan dari katalog sampai e-ticket.
 *
 * Inilah alur yang paling banyak menyentuh backend sekaligus paling merugikan
 * bila diam-diam rusak, karena menyangkut harga yang ditagihkan.
 */
describe('Pemesanan space', () => {
  /**
   * Tanggal jauh di depan yang berbeda setiap kali dijalankan.
   *
   * Jadwal yang sudah dipesan tidak pernah bebas lagi, sehingga tanggal tetap
   * akan membuat jalan kedua gagal karena bentrok dengan sisa jalan pertama.
   * Menggesernya berdasarkan waktu jalan membuat setiap jalan memakai hari
   * yang berbeda.
   */
  const TANGGAL = (() => {
    const awal = new Date('2027-01-04T00:00:00Z');
    awal.setUTCDate(awal.getUTCDate() + (Math.floor(Date.now() / 1000) % 300));
    return awal.toISOString().slice(0, 10);
  })();

  beforeEach(() => {
    cy.masukSebagai('budi', 'Secret123!');
  });

  it('menelusuri katalog lalu membuka detail space', () => {
    cy.visit('/spaces');
    cy.potret('Katalog space');

    cy.contains('Personal Desk - Flexi 01').click();

    cy.location('pathname').should('match', /^\/spaces\/\d+$/);
    cy.contains('Moklet Hub Coworking Space').should('exist');
    cy.contains('Pesan Sekarang').should('exist');
    cy.potret('Detail space');
  });

  it('menyaring katalog berdasarkan tipe space', () => {
    cy.visit('/spaces');

    cy.contains('button', 'Meeting Room').click();

    cy.location('search').should('contain', 'tipe=meeting_room');
    cy.contains('Meeting Room Alpha').should('exist');
    cy.contains('Personal Desk - Flexi 01').should('not.exist');
    cy.potret('Katalog tersaring tipe meeting room');
  });

  /**
   * Angka yang diperiksa di sini sama dengan yang dijaga pengujian unit dan
   * pengujian e2e backend: 20.000 per jam, tiga jam, promo 20 persen.
   */
  it('memesan dengan kode promo dan harganya terpotong benar', () => {
    cy.visit('/reservasi/baru?space=1');

    cy.get('input[name="tanggal_reservasi"]').clear();
    cy.get('input[name="tanggal_reservasi"]').type(TANGGAL);

    // Pilihan jam dan durasi memakai Select, bukan input biasa.
    cy.contains('label', 'Jam mulai').parent().find('button').click();
    cy.contains('[role="option"]', '09:00').click();

    cy.contains('label', 'Durasi').parent().find('button').click();
    cy.contains('[role="option"]', '3 jam').click();

    cy.contains('Jadwal tersedia', { timeout: 10_000 }).should('exist');

    // Sebelum promo: 20.000 x 3 jam.
    cy.contains('Total bayar').parent().should('contain', 'Rp 60.000');
    cy.potret('Form pemesanan sebelum promo');

    // Kode promo diketik manual, seperti yang dilakukan pengguna yang
    // mendapatkannya dari luar aplikasi.
    cy.get('#promo-manual').type('DISKONHEMAT20');
    cy.contains('button', 'Pakai').click();

    // Sesudah promo 20 persen: potongan 12.000, sisa 48.000.
    cy.contains('Total bayar', { timeout: 10_000 })
      .parent()
      .should('contain', 'Rp 48.000');
    cy.potret('Harga terpotong promo 20 persen');

    cy.contains('button', 'Lanjutkan').click();
    cy.contains('Konfirmasi pemesanan').should('be.visible');
    cy.potret('Dialog konfirmasi pemesanan');

    cy.contains('button', 'Ya, pesan sekarang').click();

    cy.contains('BOOK-', { timeout: 10_000 }).should('exist');
    cy.potret('Pemesanan berhasil dibuat');
  });

  it('menolak jadwal yang sudah dipesan orang lain', () => {
    // Satu pemesanan disiapkan lewat API supaya bentroknya pasti terjadi.
    cy.buatReservasi({
      id_space: 1,
      tanggal_reservasi: TANGGAL,
      jam_mulai: '14:00',
      durasi_jam: 2,
    });

    cy.visit('/reservasi/baru?space=1');

    cy.get('input[name="tanggal_reservasi"]').clear();
    cy.get('input[name="tanggal_reservasi"]').type(TANGGAL);

    cy.contains('label', 'Jam mulai').parent().find('button').click();
    cy.contains('[role="option"]', '14:00').click();

    // Pesannya datang dari endpoint ketersediaan, bukan dari endpoint pemesanan,
    // sehingga bunyinya memang berbeda dari penolakan saat menyimpan.
    cy.contains('sudah terisi atau dibooking', { timeout: 10_000 }).should(
      'exist',
    );
    cy.contains('button', 'Lanjutkan').should('be.disabled');
    cy.potret('Penolakan jadwal yang bentrok');
  });

  it('menampilkan e-ticket beserta QR untuk pemesanan yang sudah ada', () => {
    cy.buatReservasi({
      id_space: 1,
      tanggal_reservasi: TANGGAL,
      jam_mulai: '19:00',
      durasi_jam: 1,
    }).then((reservasi) => {
      cy.visit(`/tiket/${reservasi.id}`);

      cy.contains(reservasi.kode_booking).should('exist');
      cy.get('img[src^="data:image/png;base64,"]').should('exist');
      cy.potret('E-ticket beserta QR code');
    });
  });
});
