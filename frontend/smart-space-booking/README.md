# Smart Space Booking — Frontend

Antarmuka web sistem reservasi *coworking space* untuk UKK RPL 2026/2027 Paket
B. Mencakup katalog dan pemesanan space untuk member, serta panel pengelolaan
lokasi, master data, operasional, dan laporan untuk admin space.

Dibangun di atas backend NestJS pada folder `backend/smart-space-booking/` pada
repositori yang sama. Kontrak API keduanya sudah dipetakan satu-satu; jangan
mengarang endpoint atau field yang tidak ada di sana.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript 5, strict mode |
| UI | React 19, Tailwind CSS 4, shadcn/ui di atas base-ui |
| HTTP client | axios |
| Data server | TanStack Query 5 |
| Form | react-hook-form 7 + zod 4 |
| Grafik | recharts |
| Notifikasi | sonner |
| Pengujian | Vitest (unit) dan Cypress (ujung ke ujung) |

Alasan pemilihan versi dan keputusan teknis lain — termasuk mengapa axios
dipakai alih-alih `fetch`, dan mengapa base-ui bukan Radix — dicatat di
[`docs/KEPUTUSAN.md`](docs/KEPUTUSAN.md), 58 entri bernomor.

## Menjalankan aplikasi

Dibutuhkan Node.js 20 atau lebih baru, dan backend NestJS yang sudah berjalan
(lihat `backend/smart-space-booking/README.md`).

```bash
# 1. pasang dependency
npm install

# 2. siapkan konfigurasi
cp .env.example .env.local     # sesuaikan bila backend tidak di localhost:3000

# 3. jalankan
npm run dev                    # mode pengembangan, memuat ulang otomatis
npm run build && npm start     # mode produksi
```

Aplikasi berjalan di `http://localhost:3001`. Backend harus sudah berjalan di
`http://localhost:3000` (atau alamat yang diisi pada `NEXT_PUBLIC_API_URL`)
sebelum halaman apa pun dapat memuat data.

### Konfigurasi `.env.local`

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Alamat backend, sudah termasuk awalan `/api` |
| `NEXT_PUBLIC_JAM_BUKA` / `NEXT_PUBLIC_JAM_TUTUP` | Harus sama dengan `JAM_OPERASIONAL_BUKA`/`JAM_OPERASIONAL_TUTUP` di backend; membatasi pilihan jam pada form, penolakan sebenarnya tetap di backend |

## Akun contoh

Sama dengan yang di-seed backend — lihat `backend/smart-space-booking/README.md`.
Login member di `/login`, login admin space di `/admin/login`.

## Peta halaman

### Member (publik dan setelah login)

| Halaman | Alamat |
| --- | --- |
| Katalog space | `/spaces` |
| Detail space | `/spaces/[id]` |
| Form pemesanan | `/reservasi/baru` |
| Status pemesanan | `/reservasi` |
| Detail reservasi | `/reservasi/[id]` |
| Histori bulanan | `/reservasi/histori` |
| E-ticket | `/tiket`, `/tiket/[id]` |
| Akun | `/akun` |

### Panel pengelola (admin space)

| Halaman | Alamat |
| --- | --- |
| Dashboard | `/admin/dashboard` |
| Profil lokasi | `/admin/profil` |
| Space | `/admin/spaces` |
| Diskon | `/admin/diskon` |
| Member | `/admin/members` |
| Reservasi | `/admin/reservasi` |
| Check-in | `/admin/check-in` |
| Laporan | `/admin/laporan` |

### Autentikasi

`/login`, `/register` untuk member; `/admin/login`, `/admin/register` untuk
admin space. Proteksi rute dan pengalihan sesuai role ditangani `proxy.ts`.

## Pengujian

Ada dua lapis yang saling melengkapi.

### Unit — Vitest

```bash
npm test          # 88 pengujian atas logika di lib/
npm run test:watch
```

Cakupannya sengaja dibatasi pada logika yang harus sama persis dengan backend:
rumus harga, konversi waktu WIB, jam operasional, dan salinan mesin status
reservasi. Lihat keputusan 55–58 di `docs/KEPUTUSAN.md`.

### Ujung ke ujung — Cypress

```bash
npm run e2e       # 16 pengujian di peramban sungguhan
npm run e2e:open  # mode interaktif
```

**Backend dan frontend harus sudah berjalan lebih dulu**; Cypress tidak
menyalakannya sendiri. Yang diuji adalah alur yang dipakai pengguna: masuk,
menelusuri katalog, memesan dengan kode promo, lalu menyetujui dan mencatat
kedatangan tamu dari sisi pengelola.

Dijalankan di Chrome, bukan Electron bawaan Cypress — lihat keputusan 72 untuk
alasannya. Suite ini dapat dijalankan berulang kali: pengujian membuat space
sendiri lalu menghapusnya, sehingga jadwalnya tidak pernah bentrok dengan sisa
jalan sebelumnya.

## Struktur folder

```
app/
  (auth)/       login dan registrasi, member maupun admin space
  (member)/     katalog, pemesanan, tiket, akun — bingkai navigasi member
  admin/(panel)/  dashboard, master data, operasional, laporan — bingkai panel
  design-system/  referensi komponen dan token desain
components/
  admin/        komponen khusus panel pengelola
  auth/         form login dan registrasi
  member/       komponen khusus alur member
  layout/       navigasi, page header, error/empty state per bagian
  shared/       dipakai lintas bagian: badge, rupiah, upload gambar, dsb.
  ui/           shadcn/ui di atas base-ui
lib/
  api/          satu fungsi per endpoint backend, dikelompokkan per domain
  auth/         sesi: baca di server dan di klien
  validations/  skema zod, disalin dari DTO backend
  *.test.ts     pengujian Vitest
types/          tipe entitas, diturunkan dari serializer backend
proxy.ts        proteksi route (pengganti middleware di Next 16)
docs/           catatan keputusan teknis
```

## Perintah yang tersedia

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan di port 3001 |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan build produksi |
| `npm run lint` | Memeriksa gaya penulisan kode |
| `npm run typecheck` | Memeriksa tipe tanpa build |
| `npm test` | Pengujian unit |
| `npm run test:watch` | Pengujian unit, mode pemantauan |
| `npm run e2e` | Pengujian ujung ke ujung di Chrome |
| `npm run e2e:open` | Pengujian ujung ke ujung, mode interaktif |
