/// <reference types="cypress" />

/**
 * Operasional pengelola: menyetujui pemesanan lalu mencatat kedatangan tamu.
 *
 * Seluruh pemesanan di sini dibuat pada **space khusus yang dibuat spec ini
 * sendiri**, bukan pada space seed. Alasannya: halaman check-in hanya memuat
 * agenda hari ini, sehingga pemesanannya harus bertanggal hari ini — dan jadwal
 * hari ini yang sudah terpakai tidak pernah bebas lagi. Tanpa space sendiri,
 * menjalankan suite untuk kedua kalinya akan gagal karena jadwalnya bentrok
 * dengan sisa jalan sebelumnya.
 *
 * Space itu dihapus lagi di akhir, sehingga katalog kembali seperti semula.
 */
describe('Operasional pengelola', () => {
  const HARI_INI = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Jakarta',
  });

  let idSpace: number;

  before(() => {
    cy.masukSebagai('admin_moklet', 'Admin123!');
    cy.buatSpace(`Uji E2E ${Date.now()}`).then((id) => {
      idSpace = id;
    });
  });

  after(() => {
    cy.masukSebagai('admin_moklet', 'Admin123!');
    cy.hapusSpace(idSpace);
  });

  /** Menyiapkan satu pemesanan hari ini sebagai member. */
  function pesanHariIni(jam: string) {
    cy.masukSebagai('budi', 'Secret123!');
    return cy.buatReservasi({
      id_space: idSpace,
      tanggal_reservasi: HARI_INI,
      jam_mulai: jam,
      durasi_jam: 1,
    });
  }

  it('menyetujui, check-in, lalu check-out satu pemesanan', () => {
    pesanHariIni('08:00').then((reservasi) => {
      cy.masukSebagai('admin_moklet', 'Admin123!');
      cy.visit(`/admin/reservasi?kode=${reservasi.kode_booking}`);

      cy.contains(reservasi.kode_booking).should('exist');
      cy.contains('Belum Dikonfirmasi').should('exist');
      cy.potret('Pemesanan masuk menunggu konfirmasi');

      // Sebelum disetujui, check-in memang belum boleh ditawarkan.
      cy.contains('button', 'Check-in').should('not.exist');

      cy.contains('button', 'Setujui').click();
      cy.contains('Disetujui', { timeout: 10_000 }).should('exist');
      cy.potret('Setelah disetujui');

      cy.contains('button', 'Check-in').click();
      cy.contains('Aktif', { timeout: 10_000 }).should('exist');
      cy.potret('Setelah check-in tamu datang');

      cy.contains('button', 'Check-out').click();
      cy.contains('Selesai', { timeout: 10_000 }).should('exist');
      cy.potret('Setelah check-out selesai');

      // Status akhir tidak menyisakan tindakan apa pun.
      cy.contains('button', 'Setujui').should('not.exist');
      cy.contains('button', 'Batalkan').should('not.exist');
    });
  });

  it('mencari tamu di halaman check-in dengan kode booking', () => {
    pesanHariIni('09:00').then((reservasi) => {
      cy.masukSebagai('admin_moklet', 'Admin123!');

      // Disetujui lebih dulu supaya muncul sebagai tamu yang ditunggu.
      cy.visit(`/admin/reservasi?kode=${reservasi.kode_booking}`);
      cy.contains('button', 'Setujui').click();
      cy.contains('Disetujui', { timeout: 10_000 }).should('exist');

      cy.visit('/admin/check-in');
      cy.potret('Halaman check-in');

      cy.get('#isian-checkin').type(reservasi.kode_booking);

      cy.contains(reservasi.kode_booking).should('exist');
      cy.contains('Budi Raharjo').should('exist');
      cy.potret('Tamu ditemukan lewat kode booking');
    });
  });

  /**
   * Halaman check-in juga menerima hasil pindaian QR e-ticket, yang bentuknya
   * `VERIFY-RESERVASI-<id>`, supaya kamera ponsel biasa sudah cukup.
   */
  it('menerima payload QR pada halaman check-in', () => {
    pesanHariIni('10:00').then((reservasi) => {
      cy.masukSebagai('admin_moklet', 'Admin123!');

      cy.visit(`/admin/reservasi?kode=${reservasi.kode_booking}`);
      cy.contains('button', 'Setujui').click();
      cy.contains('Disetujui', { timeout: 10_000 }).should('exist');

      cy.visit('/admin/check-in');
      cy.get('#isian-checkin').type(`VERIFY-RESERVASI-${reservasi.id}`);

      cy.contains(reservasi.kode_booking).should('exist');
      cy.potret('Tamu ditemukan lewat hasil pindaian QR');
    });
  });

  it('menyaring daftar reservasi per bulan', () => {
    cy.masukSebagai('admin_moklet', 'Admin123!');

    cy.visit('/admin/reservasi?month=1&year=2026');
    cy.contains('0 pemesanan').should('exist');

    cy.visit('/admin/reservasi?month=8&year=2026');
    cy.contains('6 pemesanan').should('exist');
    cy.potret('Daftar reservasi tersaring bulan Agustus');
  });

  /**
   * Angka laporan diambil dari bulan yang seluruh datanya berasal dari seed,
   * sehingga tidak ikut berubah oleh pemesanan yang dibuat pengujian ini —
   * yang semuanya bertanggal hari ini.
   */
  it('menampilkan rekapitulasi pendapatan yang jumlahnya konsisten', () => {
    cy.masukSebagai('admin_moklet', 'Admin123!');
    cy.visit('/admin/laporan?month=8&year=2026');

    cy.contains('Pendapatan bersih').should('exist');
    cy.contains('Rp 446.000').should('exist');
    cy.contains('Rp 510.000').should('exist');
    cy.contains('Rp 64.000').should('exist');

    // Baris jumlah pada tabel rincian memakai angka backend, bukan hasil
    // penjumlahan di klien, sehingga keduanya harus cocok.
    cy.contains('tr', 'Jumlah').should('contain', 'Rp 446.000');
    cy.potret('Rekapitulasi pendapatan bulanan');
  });
});
