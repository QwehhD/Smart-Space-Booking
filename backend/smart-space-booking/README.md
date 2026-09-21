# Smart Space Booking — Backend API

REST API sistem reservasi *coworking space* untuk UKK RPL 2026/2027 Paket B.
Mencakup autentikasi multi-role, katalog space, kode promo, reservasi beserta
perhitungan diskon, e-ticket ber-QR, check-in/check-out, dan rekapitulasi
pendapatan bulanan.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | NestJS 11 (CommonJS) |
| Bahasa | TypeScript 5.9 |
| ORM | Prisma 6 |
| Basis data | MySQL / MariaDB |
| Autentikasi | JWT (Passport) dengan hash bcrypt |
| Validasi | class-validator dan class-transformer |
| Dokumentasi | Swagger (OpenAPI 3) |
| Pengujian | Jest dan Supertest |

Alasan pemilihan versi dan keputusan teknis lain dicatat di
[`docs/KEPUTUSAN.md`](docs/KEPUTUSAN.md).

## Menjalankan aplikasi

Dibutuhkan Node.js 20 atau lebih baru dan server MySQL/MariaDB yang berjalan.

```bash
# 1. pasang dependency
npm install

# 2. siapkan konfigurasi
cp .env.example .env          # lalu sesuaikan DATABASE_URL dan JWT_SECRET

# 3. siapkan database
npx prisma migrate deploy     # membuat kedelapan tabel
npm run seed                  # mengisi data contoh (opsional, tetapi disarankan)

# 4. jalankan
npm run start:dev             # mode pengembangan, memuat ulang otomatis
npm run start:prod            # mode produksi, setelah npm run build
```

Server berjalan di `http://localhost:3000`. Dokumentasi interaktif tersedia di
`http://localhost:3000/docs`.

### Konfigurasi `.env`

| Variabel | Keterangan |
| --- | --- |
| `PORT` | Port server, bawaan `3000` |
| `APP_URL` | Alamat publik server, dipakai menyusun URL foto |
| `FRONTEND_URL` | Origin yang diizinkan CORS |
| `DATABASE_URL` | Koneksi MySQL, misalnya `mysql://root:@localhost:3306/ukk_coworking` |
| `JWT_SECRET` | Kunci penandatangan token; wajib diganti |
| `JWT_EXPIRES_IN` | Masa berlaku token, bawaan `1d` |
| `UPLOAD_MAX_SIZE_MB` | Batas ukuran unggahan berkas, bawaan `2` |
| `JAM_OPERASIONAL_BUKA` / `JAM_OPERASIONAL_TUTUP` | Rentang jam sewa yang diizinkan |
| `STRICT_CHECKIN_DATE` | Bawaan `true`: check-in hanya boleh pada tanggal reservasinya. Isi `false` untuk demonstrasi |

## Akun contoh

Tersedia setelah `npm run seed`:

| Peran | Username | Password |
| --- | --- | --- |
| Admin space | `admin_moklet` | `Admin123!` |
| Admin space | `admin_kolaborasi` | `Admin123!` |
| Member | `budi`, `siti`, `joko`, `dewi`, `agus` | `Secret123!` |

## Bentuk response

Seluruh endpoint, sukses maupun gagal, memakai amplop yang sama:

```jsonc
// sukses
{ "status": true, "statusCode": 200, "message": "…", "data": {}, "timestamp": "…" }

// gagal
{ "status": false, "statusCode": 400, "message": "…", "error": "Bad Request", "timestamp": "…" }
```

Kegagalan validasi menambahkan `errors: [{ field, messages[] }]` agar form di
frontend dapat menandai field yang salah.

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run start:dev` | Menjalankan server dengan pemuatan ulang otomatis |
| `npm run build` | Mengompilasi ke `dist/` |
| `npm run lint` | Memeriksa dan merapikan gaya penulisan kode |
| `npm test` | Pengujian unit |
| `npm run test:e2e` | Pengujian alur dari ujung ke ujung |
| `npm run seed` | Mengisi data contoh, aman dijalankan berulang |
| `npm run db:schema` | Mengekspor skema ke `database/schema.sql` |
| `npm run docs:export` | Mengekspor `docs/swagger.json` dan `docs/postman_collection.json` |
| `npm run prisma:studio` | Membuka penjelajah data Prisma |

## Pengujian

```bash
npm test          # 42 pengujian unit: perhitungan uang, waktu, dan mesin status
npm run test:e2e  # 25 pengujian alur terhadap database sungguhan (3 suite)
```

Setiap kali dijalankan, pengujian e2e memberi akhiran `Date.now()` pada nama
akun dan space yang dibuatnya, lalu di akhir hanya menghapus baris miliknya
sendiri. Dengan begitu pengujian tidak pernah bercampur dengan data seed maupun
sisa pengujian sebelumnya, dan tidak memerlukan database khusus.

## Struktur folder

```
src/
  admin/       panel pengelola: profil, space, diskon, member, reservasi, laporan
  auth/        registrasi, login, JWT strategy, guard role
  common/      amplop response, exception filter, util, serializer
  config/      pembacaan dan validasi environment
  diskon/      katalog promo publik
  prisma/      koneksi database
  reservasi/   pemesanan, histori, e-ticket
  spaces/      katalog space dan pengecekan ketersediaan
  upload/      unggahan berkas gambar
prisma/        skema, migrasi, dan seeder
database/      schema.sql hasil ekspor
docs/          soal, catatan keputusan, swagger.json, koleksi Postman
test/          pengujian e2e
uploads/       berkas gambar yang diunggah
```

## Berkas untuk dikumpulkan

| Berkas | Cara membuat |
| --- | --- |
| Source code | folder project ini |
| `database/schema.sql` | `npm run db:schema` |
| `prisma/migrations/` | sudah termasuk di dalam repositori |
| `docs/swagger.json` | `npm run docs:export` |
| `docs/postman_collection.json` | `npm run docs:export` |
| `docs/KEPUTUSAN.md` | catatan keputusan teknis |
