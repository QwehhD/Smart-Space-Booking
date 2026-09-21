import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { pasangGlobalPrefix } from './../src/common/app-prefix';
import {
  tanggalHariIni,
  tanggalKeDateUtc,
} from './../src/common/utils/waktu.util';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Pengujian alur utama dari ujung ke ujung, memakai database sungguhan.
 *
 * Karena username kini unik secara global, setiap kali dijalankan pengujian ini
 * memakai akhiran waktu pada seluruh nama akun dan nama space yang dibuatnya.
 * Dengan begitu data pengujian tidak pernah bertabrakan dengan data seed maupun
 * sisa pengujian sebelumnya, dan di akhir hanya baris milik jalannya sendiri
 * yang dihapus lewat `bersihkan()`.
 *
 * Urutan pengujiannya sengaja berurutan, karena yang diperiksa memang alurnya:
 * space harus ada sebelum dapat dipesan, dan reservasi harus disetujui sebelum
 * dapat di-check-in.
 */
describe('Alur utama (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let tokenAdmin: string;
  let tokenMember: string;
  let idSpace: number;
  let idReservasi: number;

  const TANGGAL = '2027-03-15';
  const unik = Date.now();

  /** Nama-nama yang dibuat jalannya sendiri, dipakai juga saat pembersihan. */
  const USER_ADMIN = `admin_e2e_${unik}`;
  const USER_MEMBER = `member_e2e_${unik}`;
  const USER_ADMIN_LAIN = `lain_e2e_${unik}`;
  const NAMA_SPACE = `Personal Desk E2E ${unik}`;
  const usernameDipakai = [USER_ADMIN, USER_MEMBER, USER_ADMIN_LAIN];

  const api = () => request(app.getHttpServer());
  const sebagai = (token?: string) => (req: request.Test) =>
    token ? req.set('Authorization', `Bearer ${token}`) : req;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    pasangGlobalPrefix(app);
    await app.init();
    prisma = app.get(PrismaService);

    // Bila jalan sebelumnya berhenti di tengah, sisanya dibuang lebih dulu.
    await bersihkan();
  });

  afterAll(async () => {
    await bersihkan();
    await app.close();
  });

  /**
   * Menghapus seluruh data yang dibuat pengujian ini.
   *
   * Penghapusannya dilakukan berurutan dari anak ke induk karena `reservasi`
   * merujuk `member` tanpa cascade, sehingga urutan yang dipilih database
   * sendiri dapat melanggar foreign key itu. Titik awalnya adalah akun yang
   * dibuat jalan ini, lalu profil dan data turunannya ditelusuri dari sana.
   */
  async function bersihkan() {
    const users = await prisma.user.findMany({
      where: { username: { in: usernameDipakai } },
      select: {
        id: true,
        member: { select: { id: true } },
        space_owner: { select: { id: true } },
      },
    });

    if (users.length === 0) {
      return;
    }

    const idUser = users.map((u) => u.id);
    const idMember = users.flatMap((u) => (u.member ? [u.member.id] : []));
    const idOwner = users.flatMap((u) =>
      u.space_owner ? [u.space_owner.id] : [],
    );

    const milikJalanIni = {
      OR: [{ id_member: { in: idMember } }, { id_owner: { in: idOwner } }],
    };

    await prisma.detailReservasi.deleteMany({
      where: { reservasi: milikJalanIni },
    });
    await prisma.reservasi.deleteMany({ where: milikJalanIni });
    await prisma.diskon.deleteMany({ where: { id_owner: { in: idOwner } } });
    await prisma.space.deleteMany({ where: { id_owner: { in: idOwner } } });
    await prisma.member.deleteMany({ where: { id: { in: idMember } } });
    await prisma.spaceOwner.deleteMany({ where: { id: { in: idOwner } } });
    await prisma.user.deleteMany({ where: { id: { in: idUser } } });
  }

  it('1. mendaftarkan admin space dan member, lalu keduanya dapat login', async () => {
    await api()
      .post('/api/auth/register/admin-space')
      .send({
        username: USER_ADMIN,
        password: 'Admin123!',
        nama_coworking: `Moklet Hub E2E ${unik}`,
        nama_pemilik: 'Ahmad Bidin',
        telp: '081298765432',
      })
      .expect(201);

    await api()
      .post('/api/auth/register/member')
      .send({
        username: USER_MEMBER,
        password: 'Secret123!',
        nama_member: 'John Doe',
        instansi: 'Universitas Indonesia',
        alamat: 'Jl. Sudirman No. 123',
        telp: '081234567890',
      })
      .expect(201);

    const admin = await api()
      .post('/api/auth/login')
      .send({ username: USER_ADMIN, password: 'Admin123!' })
      .expect(200);
    const member = await api()
      .post('/api/auth/login')
      .send({ username: USER_MEMBER, password: 'Secret123!' })
      .expect(200);

    expect(admin.body.data.role).toBe('admin_space');
    expect(member.body.data.role).toBe('member');
    expect(member.body.data.space_owner).toBeNull();

    tokenAdmin = admin.body.data.access_token;
    tokenMember = member.body.data.access_token;
  });

  it('2. menolak username yang sudah dipakai', async () => {
    await api()
      .post('/api/auth/register/member')
      .send({
        username: USER_MEMBER,
        password: 'Secret123!',
        nama_member: 'John Doe Kembar',
        instansi: 'Universitas Indonesia',
        alamat: 'Jl. Sudirman No. 123',
        telp: '081234567890',
      })
      .expect(400);
  });

  it('3. menolak akses admin bagi member dan akses tanpa token', async () => {
    await sebagai(tokenMember)(api().get('/api/admin/spaces')).expect(403);
    await api().get('/api/admin/spaces').expect(401);
  });

  it('4. admin menambah space dan kode promo', async () => {
    const space = await sebagai(tokenAdmin)(api().post('/api/admin/spaces'))
      .send({
        nama_space: NAMA_SPACE,
        harga_per_jam: 20000,
        tipe: 'desk',
        kapasitas: 1,
        deskripsi: 'Meja kerja pengujian dengan WiFi kencang.',
      })
      .expect(201);

    await sebagai(tokenAdmin)(api().post('/api/admin/diskon'))
      .send({
        nama_diskon: `E2EPROMO20${unik}`,
        persentase_diskon: 20,
        // Masa berlaku promo dinilai saat pemesanan dibuat, bukan pada tanggal
        // sewanya, sehingga periodenya harus mencakup hari ini.
        tanggal_awal: '2020-01-01T00:00:00Z',
        tanggal_akhir: '2099-12-31T23:59:59Z',
      })
      .expect(201);

    idSpace = space.body.data.id;
  });

  it('5. katalog publik menampilkan space itu beserta pengelolanya', async () => {
    const res = await api()
      .get('/api/spaces')
      .query({ search: NAMA_SPACE })
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(idSpace);
    expect(res.body.data[0].owner.nama_coworking).toBe(
      `Moklet Hub E2E ${unik}`,
    );
  });

  it('6. ketersediaan menghitung jam selesai dan estimasi harganya', async () => {
    const res = await api()
      .get('/api/spaces/availability')
      .query({
        id_space: idSpace,
        tanggal: TANGGAL,
        jam_mulai: '09:00',
        durasi_jam: 3,
      })
      .expect(200);

    expect(res.body.data).toMatchObject({
      available: true,
      jam_selesai: '12:00',
      estimasi_total: 60000,
    });
  });

  it('7. member memesan dengan kode promo dan harganya dipotong', async () => {
    const res = await sebagai(tokenMember)(api().post('/api/reservasi'))
      .send({
        id_space: idSpace,
        tanggal_reservasi: TANGGAL,
        jam_mulai: '09:00',
        durasi_jam: 3,
        kode_promo: `E2EPROMO20${unik}`,
      })
      .expect(201);

    expect(res.body.data).toMatchObject({
      total_harga_awal: 60000,
      potongan_diskon: 12000,
      total_bayar: 48000,
      status: 'belum_dikonfirm',
    });
    expect(res.body.data.kode_booking).toMatch(/^BOOK-20270315-\d{4}$/);

    idReservasi = res.body.data.id;
  });

  it('8. jadwal yang sama ditolak, jadwal bersambung diterima', async () => {
    await sebagai(tokenMember)(api().post('/api/reservasi'))
      .send({
        id_space: idSpace,
        tanggal_reservasi: TANGGAL,
        jam_mulai: '10:00',
        durasi_jam: 1,
      })
      .expect(400);

    await sebagai(tokenMember)(api().post('/api/reservasi'))
      .send({
        id_space: idSpace,
        tanggal_reservasi: TANGGAL,
        jam_mulai: '12:00',
        durasi_jam: 1,
      })
      .expect(201);
  });

  it('9. admin menyetujui, check-in, lalu check-out', async () => {
    const setuju = await sebagai(tokenAdmin)(
      api().patch(`/api/admin/reservasi/${idReservasi}/status`),
    )
      .send({ status: 'disetujui' })
      .expect(200);
    expect(setuju.body.message).toContain('disetujui');

    // Tanggal sewanya bukan hari ini, jadi check-in harus ditolak.
    const terlaluDini = await sebagai(tokenAdmin)(
      api().post(`/api/admin/reservasi/${idReservasi}/check-in`),
    ).expect(400);
    expect(terlaluDini.body.message).toContain('tanggal reservasinya');

    // Jadwalnya dipindah ke hari ini langsung di database, karena member tidak
    // selalu dapat memesan hari ini: jam mulainya bisa saja sudah lewat.
    await prisma.reservasi.update({
      where: { id: idReservasi },
      data: { tanggal_reservasi: tanggalKeDateUtc(tanggalHariIni()) },
    });

    const masuk = await sebagai(tokenAdmin)(
      api().post(`/api/admin/reservasi/${idReservasi}/check-in`),
    ).expect(200);
    expect(masuk.body.data.check_in_time).not.toBeNull();

    const keluar = await sebagai(tokenAdmin)(
      api().post(`/api/admin/reservasi/${idReservasi}/check-out`),
    ).expect(200);
    expect(keluar.body.data.status).toBe('selesai');

    // Dikembalikan ke tanggal semula, yang dihitung laporan pada pengujian 11.
    await prisma.reservasi.update({
      where: { id: idReservasi },
      data: { tanggal_reservasi: tanggalKeDateUtc(TANGGAL) },
    });

    // Status akhir tidak dapat dikembalikan.
    await sebagai(tokenAdmin)(
      api().patch(`/api/admin/reservasi/${idReservasi}/status`),
    )
      .send({ status: 'disetujui' })
      .expect(400);
  });

  it('10. e-ticket memuat rincian pembayaran dan QR code', async () => {
    const res = await sebagai(tokenMember)(
      api().get(`/api/reservasi/${idReservasi}/e-ticket`),
    ).expect(200);

    expect(res.body.data.rincian_pembayaran).toMatchObject({
      tarif_kotor: 60000,
      diskon_promo: `20% (E2EPROMO20${unik})`,
      total_dibayar: 48000,
    });
    expect(res.body.data.qr_code_payload).toBe(
      `VERIFY-RESERVASI-${idReservasi}`,
    );
    expect(res.body.data.qr_code_data_url).toMatch(/^data:image\/png;base64,/);
  });

  it('11. laporan bulanan cocok dengan kedua pemesanan yang dibuat', async () => {
    const res = await sebagai(tokenAdmin)(
      api().get('/api/admin/reports/monthly').query({ month: 3, year: 2027 }),
    ).expect(200);

    // 60.000 dengan potongan 12.000, ditambah 20.000 tanpa potongan.
    expect(res.body.data).toMatchObject({
      total_transaksi: 2,
      total_jam_terpakai: 4,
      estimasi_pendapatan_kotor: 80000,
      total_potongan_diskon: 12000,
      realisasi_pendapatan_bersih: 68000,
    });
    expect(res.body.data.rincian_per_tipe_space).toHaveLength(3);

    // Maret 2027 punya 31 hari, dan jumlah seluruh harinya harus sama persis
    // dengan pendapatan bersih.
    const perHari = res.body.data.pendapatan_per_hari as {
      tanggal: string;
      total: number;
    }[];

    expect(perHari).toHaveLength(31);
    expect(perHari[0].tanggal).toBe('2027-03-01');
    expect(perHari[30].tanggal).toBe('2027-03-31');
    expect(perHari.reduce((j, h) => j + h.total, 0)).toBe(
      res.body.data.realisasi_pendapatan_bersih,
    );

    // Kedua pemesanan jatuh pada tanggal yang sama.
    const tanggalSewa = perHari.find((h) => h.tanggal === TANGGAL);
    expect(tanggalSewa?.total).toBe(68000);
  });

  it('12. member membatalkan pemesanannya dan jadwalnya kembali bebas', async () => {
    const daftar = await sebagai(tokenMember)(
      api().get('/api/reservasi/my'),
    ).expect(200);
    const menyusul = daftar.body.data.find(
      (r: { jam_mulai: string }) => r.jam_mulai === '12:00',
    );

    await sebagai(tokenMember)(
      api().patch(`/api/reservasi/${menyusul.id}/cancel`),
    ).expect(200);

    await sebagai(tokenMember)(api().post('/api/reservasi'))
      .send({
        id_space: idSpace,
        tanggal_reservasi: TANGGAL,
        jam_mulai: '12:00',
        durasi_jam: 1,
      })
      .expect(201);
  });

  /**
   * Setelah App Maker ditiadakan, pemisah data antar pengelola sepenuhnya
   * bertumpu pada `id_owner`. Karena itu pemisahan tersebut diuji langsung.
   */
  it('13. pengelola lain tidak melihat maupun dapat mengubah data pengelola ini', async () => {
    await api()
      .post('/api/auth/register/admin-space')
      .send({
        username: USER_ADMIN_LAIN,
        password: 'Admin123!',
        nama_coworking: `Ruang Lain E2E ${unik}`,
        nama_pemilik: 'Siti Aminah',
        telp: '082233445566',
      })
      .expect(201);

    const lain = await api()
      .post('/api/auth/login')
      .send({ username: USER_ADMIN_LAIN, password: 'Admin123!' })
      .expect(200);
    const tokenLain = lain.body.data.access_token as string;

    // Daftar space dan reservasinya kosong, milik pengelola pertama tak terbawa.
    const spaces = await sebagai(tokenLain)(
      api().get('/api/admin/spaces'),
    ).expect(200);
    expect(
      spaces.body.data.every((s: { id: number }) => s.id !== idSpace),
    ).toBe(true);

    const reservasi = await sebagai(tokenLain)(
      api().get('/api/admin/reservasi'),
    ).expect(200);
    expect(
      reservasi.body.data.every((r: { id: number }) => r.id !== idReservasi),
    ).toBe(true);

    // Menyentuh langsung berdasarkan id pun ditolak sebagai tidak ditemukan.
    await sebagai(tokenLain)(api().put(`/api/admin/spaces/${idSpace}`))
      .send({ harga_per_jam: 1000 })
      .expect(404);

    await sebagai(tokenLain)(
      api().patch(`/api/admin/reservasi/${idReservasi}/status`),
    )
      .send({ status: 'dibatalkan' })
      .expect(404);
  });
});
