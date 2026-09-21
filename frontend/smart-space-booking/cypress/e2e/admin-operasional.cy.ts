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

  /**
   * QR yang dipakai di sini adalah gambar asli dari e-ticket member, sehingga
   * yang diuji adalah rantai lengkapnya: backend membentuk QR, member
   * mengunduhnya, lalu pemindai di halaman check-in membacanya kembali.
   */
  it('membaca QR dari gambar e-ticket yang diunggah', () => {
    pesanHariIni('11:00').then((reservasi) => {
      cy.visit(`/tiket/${reservasi.id}`);
      cy.contains('a', 'Unduh QR')
        .should('have.attr', 'download', `QR-${reservasi.kode_booking}.png`)
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.match(/^data:image\/png;base64,/);
          const qrPng = Cypress.Buffer.from(String(href).split(',')[1], 'base64');

          cy.masukSebagai('admin_moklet', 'Admin123!');
          cy.visit(`/admin/reservasi?kode=${reservasi.kode_booking}`);
          cy.contains('button', 'Setujui').click();
          cy.contains('Disetujui', { timeout: 10_000 }).should('exist');

          cy.visit('/admin/check-in');
          cy.get('#unggah-qr').selectFile(
            { contents: qrPng, fileName: 'qr.png', mimeType: 'image/png' },
            { force: true },
          );

          cy.get('#isian-checkin').should(
            'have.value',
            `VERIFY-RESERVASI-${reservasi.id}`,
          );
          cy.contains(reservasi.kode_booking).should('exist');
          cy.contains('button', 'Check-in').should('exist');
          cy.potret('Tamu ditemukan dari gambar QR yang diunggah');
        });
    });
  });

  it('tidak menawarkan check-in di luar tanggal sewa', () => {
    const besok = new Date(Date.now() + 86_400_000).toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jakarta',
    });

    cy.masukSebagai('budi', 'Secret123!');
    cy.buatReservasi({
      id_space: idSpace,
      tanggal_reservasi: besok,
      jam_mulai: '12:00',
      durasi_jam: 1,
    }).then((reservasi) => {
      cy.masukSebagai('admin_moklet', 'Admin123!');
      cy.visit(`/admin/reservasi?kode=${reservasi.kode_booking}`);
      cy.contains('button', 'Setujui').click();
      cy.contains('Disetujui', { timeout: 10_000 }).should('exist');

      cy.contains('Check-in dibuka').should('exist');
      cy.contains('button', 'Check-in').should('not.exist');
      cy.potret('Check-in belum dibuka sebelum hari sewa');
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
  it('dapat keluar lewat tombol di sidebar', () => {
    cy.masukSebagai('admin_moklet', 'Admin123!');
    cy.visit('/admin/dashboard');

    cy.get('aside').contains('button', 'Keluar').click();
    cy.location('pathname').should('eq', '/admin/login');
  });

  /**
   * Pratinjau foto sempat selalu tampil rusak: URL objek lokalnya dicabut
   * sebelum elemen gambar dipasang. Permintaan unggahnya dicegat supaya
   * pengujian ini tidak meninggalkan berkas di folder unggahan backend.
   */
  it('menampilkan pratinjau foto setelah diunggah', () => {
    const PNG_1PX =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

    cy.intercept('POST', '**/upload/members', {
      statusCode: 201,
      body: {
        status: true,
        statusCode: 201,
        message: 'Berkas berhasil diunggah',
        data: { filename: 'uji.png', url: 'http://localhost:3000/uploads/members/uji.png' },
        timestamp: new Date().toISOString(),
      },
    });

    cy.masukSebagai('admin_moklet', 'Admin123!');
    cy.visit('/admin/members');
    cy.contains('button', 'Tambah member').first().click();

    cy.get('[role="dialog"] input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(PNG_1PX, 'base64'),
        fileName: 'uji.png',
        mimeType: 'image/png',
      },
      { force: true },
    );

    cy.contains('Foto berhasil diunggah').should('exist');
    cy.get('[role="dialog"] img').should(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
    });
  });
});
