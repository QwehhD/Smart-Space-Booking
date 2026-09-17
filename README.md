# Smart Space Booking

Sistem reservasi *coworking space* untuk **UKK RPL 2026/2027 Paket B, kategori
Fullstack**. Dikerjakan satu orang dari ujung ke ujung: backend lebih dulu,
lalu frontend.

```
backend/smart-space-booking/    NestJS 11 + Prisma 6 + MySQL/MariaDB
frontend/smart-space-booking/   Next.js 16 (App Router) + React 19 + Tailwind 4
```

Setiap folder punya `README.md` sendiri dengan instruksi lengkap. Berkas ini
hanya menunjukkan cara menjalankan keduanya bersamaan.

## Menjalankan keduanya

Backend harus berjalan lebih dulu, karena frontend memuat data dari sana pada
setiap halaman.

```bash
# terminal 1 — backend, port 3000
cd backend/smart-space-booking
npm install
cp .env.example .env            # sesuaikan DATABASE_URL dan JWT_SECRET
npx prisma migrate deploy
npm run seed
npm run start:dev

# terminal 2 — frontend, port 3001
cd frontend/smart-space-booking
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3001`. Akun contoh ada di
[`backend/smart-space-booking/README.md`](backend/smart-space-booking/README.md#akun-contoh).

## Dokumentasi

| Berkas | Isi |
| --- | --- |
| `ATURAN-KERJA.md` | Aturan git untuk pekerjaan di repositori ini |
| `backend/smart-space-booking/README.md` | Instruksi backend, endpoint, konfigurasi |
| `backend/smart-space-booking/docs/KEPUTUSAN.md` | 56 keputusan teknis backend, bernomor dan beralasan |
| `frontend/smart-space-booking/README.md` | Instruksi frontend, peta halaman |
| `frontend/smart-space-booking/docs/KEPUTUSAN.md` | 58 keputusan teknis frontend, bernomor dan beralasan |

Ketika kode dan dokumentasi keputusan berbeda, kode dan
`backend/docs/swagger.json` adalah yang benar — jangan mengarang endpoint atau
field yang tidak ada di sana.
