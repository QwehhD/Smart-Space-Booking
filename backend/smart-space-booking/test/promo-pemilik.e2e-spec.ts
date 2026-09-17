import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { pasangGlobalPrefix } from './../src/common/app-prefix';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * Kode promo hanya berlaku pada space milik pengelola yang menerbitkannya.
 *
 * Pengujian ini menyiapkan dua pengelola, masing-masing dengan satu space dan
 * satu promo, ditambah satu kode promo yang sengaja dibuat kembar di kedua
 * pengelola dengan persentase berbeda. Kode kembar itulah yang membuktikan
 * pencariannya benar-benar difilter pemilik, bukan sekadar menolak yang
 * jelas-jelas berbeda.
 *
 * Setelah App Maker ditiadakan, `id_owner` adalah satu-satunya pemisah data
 * antar pengelola, sehingga pengujian ini menjadi penjaga utamanya.
 */
describe('Kepemilikan kode promo (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let tokenMember: string;
  let spaceA: number;
  let spaceB: number;
  let promoA: number;
  let promoB: number;

  const unik = Date.now();

  /** Seluruh nama diberi akhiran waktu agar tidak bertabrakan dengan data lain. */
  const KODE_KEMBAR = `KODEKEMBAR${unik}`;
  const KODE_A = `PROMOA${unik}`;
  const KODE_B = `PROMOB${unik}`;
  const USER_A = `admin_a_${unik}`;
  const USER_B = `admin_b_${unik}`;
  const USER_MEMBER = `member_promo_${unik}`;
  const usernameDipakai = [USER_A, USER_B, USER_MEMBER];

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

    await bersihkan();

    const siapkanPengelola = async (
      username: string,
      namaSpace: string,
      kodeSendiri: string,
      persenSendiri: number,
      persenKembar: number,
    ) => {
      await api()
        .post('/api/auth/register/admin-space')
        .send({
          username,
          password: 'Admin123!',
          nama_coworking: `Hub ${username}`,
          nama_pemilik: 'Pemilik',
          telp: '081298765432',
        })
        .expect(201);

      const login = await api()
        .post('/api/auth/login')
        .send({ username, password: 'Admin123!' })
        .expect(200);
      const token = login.body.data.access_token as string;

      const space = await sebagai(token)(api().post('/api/admin/spaces'))
        .send({
          nama_space: namaSpace,
          harga_per_jam: 10000,
          tipe: 'desk',
          kapasitas: 1,
          deskripsi: 'Meja kerja pengujian promo.',
        })
        .expect(201);

      const promo = await sebagai(token)(api().post('/api/admin/diskon'))
        .send({
          nama_diskon: kodeSendiri,
          persentase_diskon: persenSendiri,
          tanggal_awal: '2020-01-01T00:00:00Z',
          tanggal_akhir: '2099-12-31T23:59:59Z',
        })
        .expect(201);

      // Kode yang sama diterbitkan kedua pengelola dengan persentase berbeda.
      await sebagai(token)(api().post('/api/admin/diskon'))
        .send({
          nama_diskon: KODE_KEMBAR,
          persentase_diskon: persenKembar,
          tanggal_awal: '2020-01-01T00:00:00Z',
          tanggal_akhir: '2099-12-31T23:59:59Z',
        })
        .expect(201);

      return {
        space: space.body.data.id as number,
        promo: promo.body.data.id as number,
      };
    };

    const a = await siapkanPengelola(USER_A, `Space A ${unik}`, KODE_A, 20, 10);
    const b = await siapkanPengelola(USER_B, `Space B ${unik}`, KODE_B, 50, 90);

    spaceA = a.space;
    promoA = a.promo;
    spaceB = b.space;
    promoB = b.promo;

    await api()
      .post('/api/auth/register/member')
      .send({
        username: USER_MEMBER,
        password: 'Secret123!',
        nama_member: 'Member Promo',
        instansi: 'SMK Telkom',
        alamat: 'Jl. Pengujian No. 1',
        telp: '081234567890',
      })
      .expect(201);

    const member = await api()
      .post('/api/auth/login')
      .send({ username: USER_MEMBER, password: 'Secret123!' })
      .expect(200);

    tokenMember = member.body.data.access_token as string;
  });

  afterAll(async () => {
    await bersihkan();
    await app.close();
  });

  /** Sama seperti pada alur utama: hanya baris milik jalan ini yang dihapus. */
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

  /** Pemesanan dengan jam berbeda tiap kali agar tidak saling bentrok. */
  let jamBerikutnya = 8;
  const pesan = (idSpace: number, promo: Record<string, unknown>) =>
    sebagai(tokenMember)(api().post('/api/reservasi')).send({
      id_space: idSpace,
      tanggal_reservasi: '2027-05-10',
      jam_mulai: `${String(jamBerikutnya++).padStart(2, '0')}:00`,
      durasi_jam: 1,
      ...promo,
    });

  it('menolak promo pengelola lain yang dipilih lewat id_diskon', async () => {
    const res = await pesan(spaceA, { id_diskon: promoB }).expect(400);

    expect(res.body.message).toBe('Kode promo tidak berlaku untuk space ini');
  });

  it('menolak promo pengelola lain yang diketik lewat kode_promo', async () => {
    const res = await pesan(spaceA, { kode_promo: KODE_B }).expect(400);

    expect(res.body.message).toBe('Kode promo tidak berlaku untuk space ini');
  });

  it('tetap membedakan promo yang memang tidak ada', async () => {
    const res = await pesan(spaceA, { kode_promo: `TIDAKADA${unik}` }).expect(
      400,
    );

    expect(res.body.message).toBe(
      'Kode promo tidak ditemukan atau sudah kedaluwarsa!',
    );
  });

  it('menerima promo milik pengelola space itu sendiri', async () => {
    const res = await pesan(spaceA, { id_diskon: promoA }).expect(201);

    // 10.000 dengan potongan 20 persen.
    expect(res.body.data.potongan_diskon).toBe(2000);
    expect(res.body.data.total_bayar).toBe(8000);
  });

  /**
   * Inilah inti perbaikannya: kode yang sama ada di kedua pengelola, dan yang
   * dipakai harus milik pengelola space yang dipesan, bukan yang kebetulan
   * ditemukan lebih dulu.
   */
  it('memakai kode kembar milik pengelola space yang dipesan', async () => {
    const diA = await pesan(spaceA, { kode_promo: KODE_KEMBAR }).expect(201);
    const diB = await pesan(spaceB, { kode_promo: KODE_KEMBAR }).expect(201);

    expect(diA.body.data.potongan_diskon).toBe(1000);
    expect(diB.body.data.potongan_diskon).toBe(9000);
  });

  it('menyaring daftar promo aktif berdasarkan space', async () => {
    const punyaA = await api()
      .get('/api/diskon/active')
      .query({ id_space: spaceA })
      .expect(200);
    const punyaB = await api()
      .get('/api/diskon/active')
      .query({ id_space: spaceB })
      .expect(200);

    const nama = (body: { data: { nama_diskon: string }[] }) =>
      body.data.map((d) => d.nama_diskon).sort();

    expect(nama(punyaA.body)).toEqual([KODE_KEMBAR, KODE_A].sort());
    expect(nama(punyaB.body)).toEqual([KODE_KEMBAR, KODE_B].sort());

    // id_owner disertakan supaya klien dapat menyaring sendiri bila perlu.
    expect(punyaA.body.data[0].id_owner).toBeDefined();
  });

  /**
   * Tanpa `id_space` daftarnya tidak disaring, sehingga promo kedua pengelola
   * sama-sama muncul. Yang diperiksa keberadaannya, bukan panjang daftarnya,
   * karena data seed juga ikut terbawa.
   */
  it('mengembalikan promo semua pengelola bila id_space tidak dikirim', async () => {
    const semua = await api().get('/api/diskon/active').expect(200);
    const nama = (semua.body.data as { nama_diskon: string }[]).map(
      (d) => d.nama_diskon,
    );

    expect(nama).toContain(KODE_A);
    expect(nama).toContain(KODE_B);
    expect(nama.filter((n) => n === KODE_KEMBAR)).toHaveLength(2);
  });

  it('memeriksa kepemilikan pada pengecekan promo bila id_space disertakan', async () => {
    await api()
      .post('/api/diskon/check')
      .send({ nama_diskon: KODE_B, id_space: spaceA })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe(
          'Kode promo tidak berlaku untuk space ini',
        );
      });

    const sah = await api()
      .post('/api/diskon/check')
      .send({ nama_diskon: KODE_B, id_space: spaceB })
      .expect(200);

    expect(sah.body.data.persentase_diskon).toBe(50);
  });

  it('mempertahankan perilaku lama saat id_space tidak dikirim', async () => {
    const res = await api()
      .post('/api/diskon/check')
      .send({ nama_diskon: KODE_B })
      .expect(200);

    expect(res.body.data.is_active).toBe(true);
  });
});
