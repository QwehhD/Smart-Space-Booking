import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Pengujian alur utama dari ujung ke ujung, memakai database sungguhan.
 *
 * Setiap kali dijalankan, pengujian ini mendaftarkan akun App Maker baru dan
 * bekerja sepenuhnya di dalam tenant tersebut. Dengan begitu data pengujian tidak
 * pernah bercampur dengan data seed maupun sisa pengujian sebelumnya, dan seluruh
 * tenantnya dapat dihapus sekali jalan di akhir karena relasinya bersifat cascade.
 *
 * Urutan pengujiannya sengaja berurutan, karena yang diperiksa memang alurnya:
 * space harus ada sebelum dapat dipesan, dan reservasi harus disetujui sebelum
 * dapat di-check-in.
 */
describe('Alur utama (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let appKey: string;
  let idMaker: number;
  let tokenAdmin: string;
  let tokenMember: string;
  let idSpace: number;
  let idReservasi: number;

  const TANGGAL = '2027-03-15';
  const unik = Date.now();

  /** Setiap request menyertakan app key tenant pengujian ini. */
  const api = () => request(app.getHttpServer());
  const sebagai = (token?: string) => (req: request.Test) => {
    req.set('x-maker-key', appKey);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['/', 'health'] });
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (idMaker) {
      await hapusTenant(idMaker);
    }

    await app.close();
  });

  /**
   * Menghapus seluruh data satu tenant.
   *
   * Penghapusannya dilakukan berurutan dari anak ke induk, bukan mengandalkan
   * cascade dari `maker`, karena `reservasi` merujuk `member` tanpa cascade
   * sehingga urutan penghapusan yang dipilih database sendiri dapat melanggar
   * foreign key itu.
   */
  async function hapusTenant(id: number) {
    await prisma.detailReservasi.deleteMany({
      where: { reservasi: { id_maker: id } },
    });
    await prisma.reservasi.deleteMany({ where: { id_maker: id } });
    await prisma.diskon.deleteMany({ where: { id_maker: id } });
    await prisma.space.deleteMany({ where: { id_maker: id } });
    await prisma.member.deleteMany({ where: { id_maker: id } });
    await prisma.spaceOwner.deleteMany({ where: { id_maker: id } });
    await prisma.user.deleteMany({ where: { id_maker: id } });
    await prisma.maker.delete({ where: { id } });
  }

  it('1. mendaftarkan App Maker dan menerbitkan app key', async () => {
    const res = await api()
      .post('/api/maker/register')
      .send({
        name: 'Penguji E2E',
        username: `e2e_${unik}`,
        email: `e2e_${unik}@smk.sch.id`,
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body.data.app_key).toMatch(/^mk_[0-9a-f]{32}$/);

    appKey = res.body.data.app_key;
    idMaker = res.body.data.id;
  });

  it('2. mendaftarkan admin space dan member, lalu keduanya dapat login', async () => {
    await sebagai()(api().post('/api/auth/register/admin-space'))
      .send({
        username: 'admin_e2e',
        password: 'Admin123!',
        nama_coworking: 'Moklet Hub E2E',
        nama_pemilik: 'Ahmad Bidin',
        telp: '081298765432',
      })
      .expect(201);

    await sebagai()(api().post('/api/auth/register/member'))
      .send({
        username: 'member_e2e',
        password: 'Secret123!',
        nama_member: 'John Doe',
        instansi: 'Universitas Indonesia',
        alamat: 'Jl. Sudirman No. 123',
        telp: '081234567890',
      })
      .expect(201);

    const admin = await sebagai()(api().post('/api/auth/login'))
      .send({ username: 'admin_e2e', password: 'Admin123!' })
      .expect(200);
    const member = await sebagai()(api().post('/api/auth/login'))
      .send({ username: 'member_e2e', password: 'Secret123!' })
      .expect(200);

    expect(admin.body.data.role).toBe('admin_space');
    expect(member.body.data.role).toBe('member');
    expect(member.body.data.space_owner).toBeNull();

    tokenAdmin = admin.body.data.access_token;
    tokenMember = member.body.data.access_token;
  });

  it('3. menolak akses admin bagi member dan akses tanpa token', async () => {
    await sebagai(tokenMember)(api().get('/api/admin/spaces')).expect(403);
    await sebagai()(api().get('/api/admin/spaces')).expect(401);
  });

  it('4. admin menambah space dan kode promo', async () => {
    const space = await sebagai(tokenAdmin)(api().post('/api/admin/spaces'))
      .send({
        nama_space: 'Personal Desk E2E',
        harga_per_jam: 20000,
        tipe: 'desk',
        kapasitas: 1,
        deskripsi: 'Meja kerja pengujian dengan WiFi kencang.',
      })
      .expect(201);

    await sebagai(tokenAdmin)(api().post('/api/admin/diskon'))
      .send({
        nama_diskon: 'E2EPROMO20',
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
    const res = await sebagai()(api().get('/api/spaces')).expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].owner.nama_coworking).toBe('Moklet Hub E2E');

    const kosong = await api().get('/api/spaces').expect(200);
    expect(
      kosong.body.data.every((s: { id: number }) => s.id !== idSpace),
    ).toBe(true);
  });

  it('6. ketersediaan menghitung jam selesai dan estimasi harganya', async () => {
    const res = await sebagai()(
      api().get('/api/spaces/availability').query({
        id_space: idSpace,
        tanggal: TANGGAL,
        jam_mulai: '09:00',
        durasi_jam: 3,
      }),
    ).expect(200);

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
        kode_promo: 'E2EPROMO20',
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

    const masuk = await sebagai(tokenAdmin)(
      api().post(`/api/admin/reservasi/${idReservasi}/check-in`),
    ).expect(200);
    expect(masuk.body.data.check_in_time).not.toBeNull();

    const keluar = await sebagai(tokenAdmin)(
      api().post(`/api/admin/reservasi/${idReservasi}/check-out`),
    ).expect(200);
    expect(keluar.body.data.status).toBe('selesai');

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
      diskon_promo: '20% (E2EPROMO20)',
      total_dibayar: 48000,
    });
    expect(res.body.data.qr_code_payload).toBe(
      `VERIFY-RESERVASI-${idReservasi}-${appKey}`,
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

  it('13. data tenant lain tidak terlihat dari app key yang berbeda', async () => {
    const lain = await api()
      .post('/api/maker/register')
      .send({
        name: 'Tenant Lain',
        username: `lain_${unik}`,
        email: `lain_${unik}@smk.sch.id`,
        password: 'Password123!',
      })
      .expect(201);

    // Body supertest bertipe any, jadi bentuk yang dipakai dinyatakan di sini.
    const { id: idLain, app_key: keyLain } = lain.body.data as {
      id: number;
      app_key: string;
    };

    const katalog = await api()
      .get('/api/spaces')
      .set('x-maker-key', keyLain)
      .expect(200);
    expect(katalog.body.data).toHaveLength(0);

    // Token dari tenant ini ditolak bila dipakai bersama app key tenant lain.
    await api()
      .get('/api/auth/profile')
      .set('x-maker-key', keyLain)
      .set('Authorization', `Bearer ${tokenMember}`)
      .expect(401);

    await hapusTenant(idLain);
  });
});
