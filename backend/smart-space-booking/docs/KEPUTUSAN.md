# Catatan Keputusan Desain

Dokumen ini mencatat keputusan teknis yang tidak diatur secara eksplisit di soal UKK
maupun di spesifikasi tambahan, beserta alasannya.

## 1. Letak folder project tetap `backend/smart-space-booking/`

Struktur folder pada spesifikasi menggambarkan `backend/` sebagai akar project. Namun di
repositori ini sisi frontend sudah berada di `frontend/smart-space-booking/`, sehingga
backend dibiarkan sejajar di `backend/smart-space-booking/` agar pola kedua sisi konsisten
dan path yang sudah tercatat di git tidak berubah.

## 2. NestJS 11 LTS, bukan NestJS 12

Spesifikasi meminta "NestJS versi stabil terbaru" sekaligus CommonJS, Jest, dan Supertest.
NestJS 12 dirilis sebagai paket ESM-only, sehingga tidak dapat dimuat dari kode CommonJS
(`@nestjs/testing` gagal di-`require` oleh Jest). Selain itu `@nestjs/throttler` belum
mendukung NestJS 12 sehingga instalasi memerlukan `--legacy-peer-deps`.

Karena itu dipilih NestJS 11.2.4 yang masih CJS-native: seluruh paket pendamping
(`config`, `jwt`, `passport`, `swagger`, `throttler`) resolve tanpa flag tambahan dan
kombinasi Jest + ts-jest bekerja sebagaimana disyaratkan spesifikasi.

## 3. TypeScript 5.9 dan Prisma 6

`ts-jest` menyatakan dukungan TypeScript `>=4.3 <7`, sehingga TypeScript 6/7 belum dapat
dipakai bersama Jest. Prisma dipin ke 6.19.3 karena versi 8 masih berstatus release
candidate, sementara versi 6 adalah rilis stabil yang matang untuk MySQL.

## 4. Nama field Prisma memakai `snake_case`

Konvensi Prisma umumnya `camelCase` di sisi model dan `@map` ke kolom `snake_case`. Di
sini nama field model dibuat sama persis dengan nama kolom (`nama_member`,
`harga_per_jam`, dan seterusnya) karena kontrak API juga memakai `snake_case`. Dengan
begitu hasil query dapat dikembalikan tanpa lapisan pemetaan tambahan, sehingga
kemungkinan salah ketik nama field antara database dan response berkurang. `@@map` tetap
dipakai untuk nama tabel yang berbeda dari nama model (`User` → `users`).

## 5. Kolom jam disimpan sebagai `VARCHAR(5)`, bukan `TIME`

Spesifikasi mengizinkan kedua opsi. Dipilih `VARCHAR(5)` dengan format `HH:mm` karena
Prisma memetakan kolom `TIME` MySQL ke objek `DateTime` JavaScript bertanggal
1970-01-01 UTC. Dengan `TZ=Asia/Jakarta`, setiap pembacaan dan penulisan harus memakai
getter/setter UTC secara konsisten di service, seeder, maupun laporan — satu saja yang
terlewat akan menggeser jam tujuh jam dan merusak pengecekan bentrok jadwal.

Format `HH:mm` selalu dua digit sehingga perbandingan string (`<`, `>`) identik dengan
perbandingan waktu, dan nilai yang tersimpan di database langsung terbaca manusia.
Kolom `tanggal_reservasi` tetap bertipe `DATE` karena dibutuhkan untuk filter rentang
tanggal pada laporan bulanan; pembacaannya akan memakai util yang selalu memformat dari
komponen UTC agar hari tidak bergeser.

## 6. Unique `(id_owner, nama_diskon)` berlaku juga untuk data yang sudah dihapus

Constraint unik dipasang di level database sesuai spesifikasi. Konsekuensinya, kode promo
yang sudah di-soft-delete tidak dapat dibuat ulang dengan nama yang sama oleh pemilik yang
sama. Ini dianggap wajar karena riwayat reservasi lama masih merujuk ke kode tersebut,
sehingga memakai ulang nama yang sama berpotensi membingungkan saat penelusuran laporan.

## 7. Migrasi awal dibuat secara offline, lalu diterapkan dan diverifikasi

Saat skema disusun, mesin pengembangan belum memiliki database yang dapat diakses sehingga
`prisma migrate dev` tidak dapat dijalankan. File
`prisma/migrations/20260915000000_init/migration.sql` dihasilkan dengan
`prisma migrate diff --from-empty --to-schema-datamodel`, yang menghasilkan SQL identik
dengan migrasi normal.

Migrasi tersebut kini sudah diterapkan dengan `npx prisma migrate deploy`. Perubahan skema
untuk App Maker ditambahkan sebagai migrasi kedua
(`20260915001000_add_app_maker_multi_tenancy`), bukan dengan menulis ulang migrasi awal
yang sudah ter-commit, mengikuti sifat migrasi yang hanya boleh ditambah. Endpoint `/health`, registrasi member, dan registrasi
admin space sudah diuji terhadap database sungguhan: password tersimpan sebagai hash
bcrypt 60 karakter berawalan `$2b$10$`, dan username ganda ditolak dengan pesan yang
sesuai kontrak.

## 8. Database pengembangan lokal memakai akun anonim dan awalan `test_`

`.env.example` tetap memakai `mysql://root:@localhost:3306/ukk_coworking` sesuai
spesifikasi, karena di komputer penguji MySQL biasanya dijalankan lewat XAMPP dengan root
tanpa password.

Mesin pengembangan ini memakai MariaDB bawaan Arch Linux, yang mengautentikasi root dengan
plugin `unix_socket` sehingga root hanya dapat dipakai lewat `sudo` dan tidak dapat diakses
Prisma melalui TCP. Membuat user database khusus memerlukan akses `sudo` yang tidak selalu
tersedia di sesi non-interaktif.

Karena itu `.env` lokal diarahkan ke `mysql://@127.0.0.1:3306/test_ukk_coworking`. MariaDB
memberikan hak penuh kepada akun anonim atas database yang namanya berawalan `test_`,
sehingga database pengembangan dapat dibuat dan dimigrasikan tanpa `sudo` sama sekali dan
tanpa melemahkan autentikasi root. Nama database hanya berlaku lokal, tidak memengaruhi
kode maupun berkas yang dikumpulkan.

## 9. Multi-tenancy App Maker dipasang di level tabel, bukan hanya di level query

Ketentuan global no. 1 pada soal mewajibkan header `x-maker-key` (alias `x-app-key`) di
setiap request dan menjanjikan isolasi otomatis atas data Member, Space, Diskon, dan
Reservasi. Karena itu tenancy dijadikan bagian skema, bukan sekadar filter yang ditambahkan
di setiap service.

Kolom `id_maker` dipasang langsung di `users`, `member`, `space_owner`, `space`, `diskon`,
dan `reservasi`. Nilai ini memang dapat ditelusuri lewat relasi, misalnya member melalui
`users`, tetapi menyimpannya langsung membuat setiap tabel dapat difilter dan diindeks per
tenant tanpa join. `detail_reservasi` tidak diberi kolom tersebut karena berelasi satu-satu
dengan `reservasi` dan selalu diakses melalui induknya.

`users.username` yang semula unik global diubah menjadi unik per maker
(`@@unique([id_maker, username])`), demikian pula `reservasi.kode_booking`. Tanpa perubahan
ini dua siswa tidak dapat memakai username contoh yang sama seperti `johndoe`, padahal
justru itulah yang diisolasi.

## 10. App key tanpa header memakai maker bawaan, app key salah ditolak

`MakerContextGuard` menempelkan tenant ke setiap request. Request tanpa header diarahkan ke
maker bawaan `mk_default_ukk_2026` yang muncul pada contoh `GET /api/maker/list`, sehingga
endpoint publik tetap dapat dicoba tanpa mendaftar lebih dulu. Sebaliknya app key yang
dikirim tetapi tidak dikenal ditolak dengan 401, agar salah ketik satu karakter tidak
diam-diam menulis data ke tenant lain.

Tenancy diwujudkan sebagai guard, bukan middleware, karena exception filter global di
NestJS tidak menangkap error dari middleware; dengan guard, penolakan app key tetap
memperoleh amplop response yang sama dengan endpoint lain. Endpoint `/` dan `/health`
ditandai `@SkipMakerContext()` karena tidak menyentuh data tenant, sekaligus supaya health
check tidak ikut membuat maker bawaan.

Maker bawaan dibuat saat pertama kali dibutuhkan lalu id-nya di-cache, bukan saat aplikasi
boot, supaya aplikasi tetap dapat dijalankan dan `/health` tetap dapat melaporkan
`database: "disconnected"` ketika database belum siap. Password akun bawaan diisi nilai acak
yang tidak pernah dicatat, karena akun itu hanya berfungsi sebagai wadah data dan tidak
dimaksudkan untuk login.

## 11. Token maker dan token user dibedakan lewat klaim `type`

Token akun maker dan token member/admin space ditandatangani dengan secret yang sama, jadi
tanpa pembeda apa pun token member akan diterima sebagai token maker dan dapat dipakai
membaca app key. Karena itu token maker membawa klaim `type: 'maker'`, dan `MakerAuthGuard`
menolak token yang tidak memuatnya. Guard user nantinya melakukan kebalikannya.

## 12. `/api/maker/stats` tidak menghitung data yang sudah dihapus dan reservasi batal

Soal tidak merinci cara menghitung angka pada statistik, jadi dipilih penghitungan yang
paling sesuai dengan apa yang dilihat pemakai. `total_members`, `total_spaces`, dan
`total_diskon` mengabaikan baris yang sudah di-soft-delete karena bagi pemakai data itu
sudah tidak ada.

`total_pendapatan` dijumlahkan dari `detail_reservasi.total_harga`, yaitu nilai setelah
potongan diskon, mengikuti aritmetika laporan bulanan pada soal yang menunjukkan
`realisasi_pendapatan_bersih` sama dengan pendapatan kotor dikurangi potongan. Reservasi
berstatus `dibatalkan` tidak diikutkan karena bukan pendapatan, sementara `total_reservasi`
tetap menghitung seluruh reservasi termasuk yang batal, karena yang ditanyakan adalah jumlah
transaksi yang pernah terjadi.

## 13. Login membalas 200, bukan 201

NestJS memberi status 201 pada setiap handler `@Post`. Untuk endpoint login hal itu keliru
karena tidak ada sumber daya yang dibuat, dan soal memang mencontohkan 200, sehingga login
memakai `@HttpCode(HttpStatus.OK)`.
