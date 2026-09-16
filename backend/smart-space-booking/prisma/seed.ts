import {
  PrismaClient,
  Role,
  StatusReservasi,
  TipeSpace,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Pengisi data contoh untuk pengembangan dan demonstrasi.
 *
 * Seluruh langkahnya idempoten: setiap baris dicari lebih dulu berdasarkan
 * kunci alaminya, lalu dibuat bila belum ada dan disesuaikan bila sudah. Dengan
 * begitu `npm run seed` dapat dijalankan berkali-kali tanpa menggandakan data
 * maupun menghapus data yang sudah ada.
 *
 * Datanya dimasukkan ke maker bawaan `mk_default_ukk_2026`, yaitu tenant yang
 * dipakai ketika request tidak menyertakan header `x-maker-key`, sehingga hasil
 * seed langsung terlihat tanpa konfigurasi apa pun di frontend.
 */

const prisma = new PrismaClient();

const APP_KEY_BAWAAN = 'mk_default_ukk_2026';
const SALT_ROUNDS = 10;

/** Password contoh sengaja seragam dan dicatat di README agar mudah diuji. */
const PASSWORD_ADMIN = 'Admin123!';
const PASSWORD_MEMBER = 'Secret123!';

const JAM_BUKA = 7;

async function main() {
  const maker = await pastikanMakerBawaan();
  const owners = await pastikanOwner(maker.id);
  const members = await pastikanMember(maker.id);
  const spaces = await pastikanSpace(maker.id, owners);
  await pastikanDiskon(maker.id, owners);
  const jumlahReservasi = await pastikanReservasi(maker.id, members, spaces);

  console.log('Seed selesai:');
  console.log(`  maker       : ${maker.app_key}`);
  console.log(`  space owner : ${owners.length}`);
  console.log(`  member      : ${members.length}`);
  console.log(`  space       : ${spaces.length}`);
  console.log(`  reservasi   : ${jumlahReservasi} baru pada kali ini`);
  console.log('');
  console.log(`  login admin : admin_moklet / ${PASSWORD_ADMIN}`);
  console.log(`  login member: budi / ${PASSWORD_MEMBER}`);
}

async function pastikanMakerBawaan() {
  return prisma.maker.upsert({
    where: { app_key: APP_KEY_BAWAAN },
    update: {},
    create: {
      name: 'Admin Default UKK',
      username: 'admin_default',
      email: 'admin@ukk.sch.id',
      app_key: APP_KEY_BAWAAN,
      password: await bcrypt.hash(PASSWORD_ADMIN, SALT_ROUNDS),
    },
  });
}

/** Akun login beserta profilnya, dicari berdasarkan username dalam tenant. */
async function upsertUser(
  idMaker: number,
  username: string,
  password: string,
  role: Role,
) {
  return prisma.user.upsert({
    where: { id_maker_username: { id_maker: idMaker, username } },
    update: {},
    create: {
      username,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      role,
      id_maker: idMaker,
    },
  });
}

async function pastikanOwner(idMaker: number) {
  const daftar = [
    {
      username: 'admin_moklet',
      nama_coworking: 'Moklet Hub Coworking Space',
      nama_pemilik: 'Ahmad Bidin, S.Kom',
      telp: '081298765432',
      alamat: 'Jl. Danau Ranau No. 1, Sawojajar, Malang',
      deskripsi:
        'Coworking space di pusat kota dengan WiFi 100Mbps dan ruang rapat lengkap.',
    },
    {
      username: 'admin_kolaborasi',
      nama_coworking: 'Ruang Kolaborasi Nusantara',
      nama_pemilik: 'Siti Aminah, M.M.',
      telp: '082233445566',
      alamat: 'Jl. Soekarno Hatta No. 45, Malang',
      deskripsi:
        'Tempat kerja bersama yang tenang, cocok untuk tim kecil dan rapat klien.',
    },
  ];

  const hasil = [];

  for (const data of daftar) {
    const user = await upsertUser(
      idMaker,
      data.username,
      PASSWORD_ADMIN,
      Role.admin_space,
    );

    hasil.push(
      await prisma.spaceOwner.upsert({
        where: { id_user: user.id },
        update: {
          nama_coworking: data.nama_coworking,
          nama_pemilik: data.nama_pemilik,
          telp: data.telp,
          alamat: data.alamat,
          deskripsi: data.deskripsi,
        },
        create: {
          nama_coworking: data.nama_coworking,
          nama_pemilik: data.nama_pemilik,
          telp: data.telp,
          alamat: data.alamat,
          deskripsi: data.deskripsi,
          id_user: user.id,
          id_maker: idMaker,
        },
      }),
    );
  }

  return hasil;
}

async function pastikanMember(idMaker: number) {
  const daftar = [
    { username: 'budi', nama: 'Budi Raharjo', instansi: 'SMK Telkom Malang', telp: '085712345678' },
    { username: 'siti', nama: 'Siti Nurhaliza', instansi: 'Universitas Brawijaya', telp: '085712345679' },
    { username: 'joko', nama: 'Joko Susilo', instansi: 'PT Maju Bersama', telp: '085712345680' },
    { username: 'dewi', nama: 'Dewi Lestari', instansi: 'Freelance Designer', telp: '085712345681' },
    { username: 'agus', nama: 'Agus Salim', instansi: 'Startup Rintisan', telp: '085712345682' },
  ];

  const hasil = [];

  for (const [i, data] of daftar.entries()) {
    const user = await upsertUser(
      idMaker,
      data.username,
      PASSWORD_MEMBER,
      Role.member,
    );

    hasil.push(
      await prisma.member.upsert({
        where: { id_user: user.id },
        update: {
          nama_member: data.nama,
          instansi: data.instansi,
          telp: data.telp,
        },
        create: {
          nama_member: data.nama,
          instansi: data.instansi,
          alamat: `Jl. Contoh No. ${i + 1}, Malang`,
          telp: data.telp,
          id_user: user.id,
          id_maker: idMaker,
        },
      }),
    );
  }

  return hasil;
}

async function pastikanSpace(
  idMaker: number,
  owners: { id: number }[],
) {
  const daftar = [
    { owner: 0, nama_space: 'Personal Desk - Flexi 01', harga: 20000, tipe: TipeSpace.desk, kapasitas: 1, deskripsi: 'Meja kerja individual dengan colokan listrik, WiFi 100Mbps, dan lampu meja LED.' },
    { owner: 0, nama_space: 'Personal Desk - Flexi 02', harga: 20000, tipe: TipeSpace.desk, kapasitas: 1, deskripsi: 'Meja kerja individual dekat jendela dengan pencahayaan alami.' },
    { owner: 0, nama_space: 'Meeting Room Alpha', harga: 100000, tipe: TipeSpace.meeting_room, kapasitas: 8, deskripsi: 'Ruang rapat kedap suara dengan Smart TV 55 inch dan whiteboard kaca.' },
    { owner: 0, nama_space: 'Private Office Garuda', harga: 150000, tipe: TipeSpace.private_office, kapasitas: 4, deskripsi: 'Kantor privat untuk tim kecil, dilengkapi loker dan akses 24 jam.' },
    { owner: 1, nama_space: 'Hot Desk Nusantara 01', harga: 18000, tipe: TipeSpace.desk, kapasitas: 1, deskripsi: 'Meja bebas pilih dengan free flow kopi dan teh.' },
    { owner: 1, nama_space: 'Meeting Room Cendana', harga: 90000, tipe: TipeSpace.meeting_room, kapasitas: 6, deskripsi: 'Ruang rapat dengan proyektor dan papan tulis.' },
  ];

  const hasil = [];

  for (const data of daftar) {
    const idOwner = owners[data.owner].id;
    const ada = await prisma.space.findFirst({
      where: { id_owner: idOwner, nama_space: data.nama_space },
    });

    hasil.push(
      ada
        ? await prisma.space.update({
            where: { id: ada.id },
            data: {
              harga_per_jam: data.harga,
              kapasitas: data.kapasitas,
              deskripsi: data.deskripsi,
              deleted_at: null,
            },
          })
        : await prisma.space.create({
            data: {
              nama_space: data.nama_space,
              harga_per_jam: data.harga,
              tipe: data.tipe,
              kapasitas: data.kapasitas,
              deskripsi: data.deskripsi,
              id_owner: idOwner,
              id_maker: idMaker,
            },
          }),
    );
  }

  return hasil;
}

async function pastikanDiskon(idMaker: number, owners: { id: number }[]) {
  const tahun = new Date().getFullYear();

  const daftar = [
    { owner: 0, nama: 'DISKONHEMAT20', persen: 20, awal: `${tahun}-01-01`, akhir: `${tahun}-12-31` },
    { owner: 0, nama: 'UKKPROMO50', persen: 50, awal: `${tahun}-01-01`, akhir: `${tahun}-12-31` },
    { owner: 0, nama: 'PROMOLAMA', persen: 30, awal: `${tahun - 2}-01-01`, akhir: `${tahun - 2}-12-31` },
    { owner: 1, nama: 'NUSANTARA15', persen: 15, awal: `${tahun}-01-01`, akhir: `${tahun}-12-31` },
  ];

  for (const data of daftar) {
    const idOwner = owners[data.owner].id;

    await prisma.diskon.upsert({
      where: {
        id_owner_nama_diskon: { id_owner: idOwner, nama_diskon: data.nama },
      },
      update: {
        persentase_diskon: data.persen,
        tanggal_awal: new Date(`${data.awal}T00:00:00.000Z`),
        tanggal_akhir: new Date(`${data.akhir}T23:59:59.000Z`),
        deleted_at: null,
      },
      create: {
        nama_diskon: data.nama,
        persentase_diskon: data.persen,
        tanggal_awal: new Date(`${data.awal}T00:00:00.000Z`),
        tanggal_akhir: new Date(`${data.akhir}T23:59:59.000Z`),
        id_owner: idOwner,
        id_maker: idMaker,
      },
    });
  }
}

/**
 * Reservasi contoh disebar pada tiga bulan terakhir sampai bulan depan, dengan
 * status yang bervariasi, supaya laporan bulanan dan histori member langsung
 * memiliki angka yang bisa dilihat.
 *
 * Setiap baris dikenali dari kombinasi space, tanggal, dan jam mulainya,
 * sehingga menjalankan ulang seed tidak menggandakan pemesanan.
 */
async function pastikanReservasi(
  idMaker: number,
  members: { id: number }[],
  spaces: { id: number; id_owner: number; harga_per_jam: number }[],
) {
  const sekarangUntukPromo = new Date();
  const diskon = await prisma.diskon.findMany({
    where: {
      id_maker: idMaker,
      deleted_at: null,
      tanggal_awal: { lte: sekarangUntukPromo },
      tanggal_akhir: { gte: sekarangUntukPromo },
    },
    orderBy: { id: 'asc' },
  });

  // Promo hanya berlaku pada space milik pengelola yang menerbitkannya, sehingga
  // setiap space dipasangkan dengan promo milik pengelolanya sendiri.
  const promoPerOwner = new Map<number, (typeof diskon)[number]>();
  for (const d of diskon) {
    if (!promoPerOwner.has(d.id_owner)) {
      promoPerOwner.set(d.id_owner, d);
    }
  }

  const statusBerurutan = [
    StatusReservasi.selesai,
    StatusReservasi.selesai,
    StatusReservasi.disetujui,
    StatusReservasi.belum_dikonfirm,
    StatusReservasi.dibatalkan,
  ];

  let dibuat = 0;
  const hariIni = new Date();

  for (let i = 0; i < 25; i += 1) {
    const space = spaces[i % spaces.length];
    const member = members[i % members.length];
    const status = statusBerurutan[i % statusBerurutan.length];

    // Tersebar dari dua bulan lalu sampai bulan depan.
    const tanggal = new Date(
      Date.UTC(
        hariIni.getFullYear(),
        hariIni.getMonth() - 2 + Math.floor(i / 8),
        ((i * 3) % 27) + 1,
      ),
    );

    const jamMulaiAngka = JAM_BUKA + (i % 8);
    const durasi = (i % 3) + 1;
    const jamMulai = `${String(jamMulaiAngka).padStart(2, '0')}:00`;
    const jamSelesai = `${String(jamMulaiAngka + durasi).padStart(2, '0')}:00`;

    const sudahAda = await prisma.reservasi.findFirst({
      where: {
        id_maker: idMaker,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        detail: { id_space: space.id },
      },
    });

    if (sudahAda) {
      continue;
    }

    const promo = i % 4 === 0 ? promoPerOwner.get(space.id_owner) : undefined;
    const tarifKotor = space.harga_per_jam * durasi;
    const potongan = promo
      ? Math.floor((tarifKotor * promo.persentase_diskon) / 100)
      : 0;

    const baru = await prisma.reservasi.create({
      data: {
        kode_booking: `SEMENTARA-${Date.now()}-${i}`,
        tanggal_reservasi: tanggal,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        durasi_jam: durasi,
        id_owner: space.id_owner,
        id_member: member.id,
        id_maker: idMaker,
        status,
        ...(status === StatusReservasi.selesai && {
          check_in_time: new Date(tanggal),
          check_out_time: new Date(tanggal),
        }),
        ...(status === StatusReservasi.dibatalkan && {
          catatan_batal: 'Dibatalkan oleh member',
        }),
        detail: {
          create: {
            id_space: space.id,
            id_diskon: promo?.id ?? null,
            harga_per_jam: space.harga_per_jam,
            total_harga_awal: tarifKotor,
            persentase_diskon: promo?.persentase_diskon ?? 0,
            potongan_diskon: potongan,
            total_harga: tarifKotor - potongan,
          },
        },
      },
    });

    const kode = `BOOK-${tanggal.toISOString().slice(0, 10).replace(/-/g, '')}-${String(baru.id).padStart(4, '0')}`;
    await prisma.reservasi.update({
      where: { id: baru.id },
      data: { kode_booking: kode },
    });

    dibuat += 1;
  }

  return dibuat;
}

main()
  .catch((error: unknown) => {
    console.error('Seed gagal:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
