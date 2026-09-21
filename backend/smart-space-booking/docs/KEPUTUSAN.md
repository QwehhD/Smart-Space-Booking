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

> **Dicabut oleh keputusan 56.** Bagian ini disimpan sebagai catatan riwayat.

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

> **Dicabut oleh keputusan 56.** Bagian ini disimpan sebagai catatan riwayat.

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

> **Dicabut oleh keputusan 56.** Bagian ini disimpan sebagai catatan riwayat.

Token akun maker dan token member/admin space ditandatangani dengan secret yang sama, jadi
tanpa pembeda apa pun token member akan diterima sebagai token maker dan dapat dipakai
membaca app key. Karena itu token maker membawa klaim `type: 'maker'`, dan `MakerAuthGuard`
menolak token yang tidak memuatnya. Guard user nantinya melakukan kebalikannya.

## 12. `/api/maker/stats` tidak menghitung data yang sudah dihapus dan reservasi batal

> **Dicabut oleh keputusan 56.** Bagian ini disimpan sebagai catatan riwayat.

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

## 14. JwtAuthGuard dipasang global, endpoint tertutup secara bawaan

Guard autentikasi dipasang sebagai `APP_GUARD`, lalu endpoint yang memang publik
ditandai `@Public()`. Pilihan ini diambil agar kesalahan yang paling mudah terjadi, yaitu
lupa memasang guard pada endpoint baru, berakibat endpoint tertutup dan langsung terlihat
saat dicoba, bukan endpoint terbuka yang diam-diam dapat diakses siapa saja.

## 15. Akun dibaca ulang dari database pada setiap request

`JwtStrategy` membaca ulang akun dari database pada setiap request, bukan mempercayai isi token,
supaya akun yang sudah dihapus berhenti berlaku seketika dan tidak menunggu masa berlaku
token habis. Member yang sudah di-soft-delete diperlakukan sebagai akun yang tidak ada, baik
saat login maupun saat memakai token yang sudah terbit, karena bagi admin yang menghapusnya
akses member tersebut memang sudah dicabut.

Pemeriksaan ini tidak terlihat dari bentuk response mana pun, sehingga diuji langsung di
tingkat unit pada `src/auth/strategies/jwt.strategy.spec.ts`, tidak menunggu tahap pengujian
di akhir.

## 16. Pembatasan role memakai guard global dan menolak endpoint yang keliru dibiarkan publik

`RolesGuard` didaftarkan sebagai `APP_GUARD` setelah `JwtAuthGuard`, sehingga membatasi
endpoint cukup dengan menambahkan `@Roles(Role.admin_space)` tanpa memasang `@UseGuards` di
setiap controller. Endpoint tanpa decorator tersebut terbuka untuk semua pengguna yang sudah
login, karena pembatasan role adalah lapisan di atas autentikasi dan bukan penggantinya.

Bila sebuah endpoint memiliki `@Roles(...)` tetapi tidak ada pengguna pada request, artinya
endpoint itu keliru ditandai `@Public()`. Keadaan ini ditolak dengan 403, bukan diloloskan,
supaya kesalahan konfigurasi tersebut langsung terlihat saat dicoba dan tidak menjadi
endpoint admin yang terbuka.

Soal tidak mencontohkan pesan untuk 403, sehingga dipakai pesan
"Anda tidak memiliki hak akses untuk melakukan tindakan ini!" dengan bentuk amplop error yang
sama seperti status lainnya.

## 17. Hanya `GET /api/auth/profile` yang dibuat, tanpa ubah profil dan ganti password

Daftar 50 endpoint pada soal hanya memuat `GET /api/auth/profile` untuk akun pengguna.
Tidak ada endpoint untuk mengubah profil sendiri maupun mengganti password, dan pengelolaan
data member dilakukan admin lewat `/api/admin/members`. Karena itu keduanya tidak dibuat,
agar cakupan pekerjaan tetap sama dengan yang diminta.

Bentuk response profil sengaja berbeda dari login dan mengikuti contoh soal apa adanya:
profil hanya memuat kunci yang relevan dengan role pengguna, tanpa kunci lawannya yang
bernilai null, sedangkan login memuat keduanya.

## 18. Pembatasan laju hanya pada endpoint auth, dengan batas yang longgar

Soal tidak meminta pembatasan laju, tetapi login dan registrasi adalah endpoint yang paling
mudah dicoba berulang, dan `@nestjs/throttler` sudah termasuk dependency yang dipasang sejak
awal. `ThrottlerGuard` karena itu dipasang hanya pada controller auth, bukan global, supaya
katalog space dan endpoint lain tidak ikut terbatasi.

Batasnya 10 request per menit per alamat IP. Angka itu jauh di atas pemakaian manusia biasa
maupun pengujian dengan Postman, sehingga tidak mengganggu penguji, tetapi cukup untuk
menghentikan percobaan password secara beruntun.

Pesan bawaan pustaka, "ThrottlerException: Too Many Requests", diganti lewat
`AuthThrottlerGuard` karena berbahasa Inggris dan menyebut nama kelas internal, sementara
pesan ini akan tampil langsung di form login.

## 19. Pesan 401 tidak membedakan sebab kegagalan token

`JwtAuthGuard.handleRequest` mengganti balasan "Unauthorized" bawaan Passport dengan
"Token tidak valid atau sudah kedaluwarsa!". Satu pesan dipakai untuk token yang hilang,
rusak, kedaluwarsa, maupun milik akun yang sudah dihapus. Membedakannya akan memberi petunjuk yang berguna bagi yang mencoba-coba, sedangkan
bagi pemakai yang sah tindakan pemulihannya sama saja, yaitu login ulang.

## 20. Endpoint upload dibuat publik mengikuti kontrak rincinya

Ringkasan daftar endpoint pada soal menyebut `POST /api/upload/spaces` sebagai milik Admin
Space, tetapi kontrak rinci ketiga endpoint upload sama-sama menyebut
"Auth: Tidak diperlukan / Header x-maker-key". Kontrak rinci dipakai sebagai acuan karena
lebih spesifik dan disertai contoh request beserta responsnya.

Pilihan ini juga cocok dengan alur pemakaiannya: foto diunggah lebih dulu, lalu nama
berkasnya dikirim sebagai field `foto` saat membuat space atau member, sehingga unggahan
terjadi sebelum sumber daya yang memilikinya ada.

## 21. Nama berkas dibuat ulang, dan ekstensinya diambil dari mimetype

Nama berkas kiriman tidak pernah dipakai. Setiap unggahan disimpan dengan nama
`<epoch>-<acak>.<ext>` mengikuti contoh pada soal (`1787799592972-544446318.jpeg`), sehingga
dua berkas dengan nama asli yang sama tidak saling menimpa dan nama kiriman tidak dapat
menyelipkan komponen path yang keluar dari folder tujuan.

Ekstensinya diturunkan dari mimetype, bukan dari nama asli. Contoh pada soal menunjukkan hal
yang sama: berkas `banner.jpg` tersimpan sebagai `.jpeg`. Nama asli tetap dikembalikan pada
`original_name` khusus untuk `POST /api/upload/image`, sesuai bentuk response yang diminta.

Mimetype dan ekstensi nama asli diperiksa berdua. Mimetype mudah dipalsukan pengirim,
sedangkan ekstensi saja tidak memastikan isi berkasnya, sehingga keduanya harus cocok.
Jenis `.webp` hanya diterima pada unggahan gambar umum karena soal hanya mencantumkannya di
sana, sedangkan foto space dan member dibatasi JPEG dan PNG.

## 22. Kegagalan unggahan dibalas 413 untuk ukuran, dan pesannya diterjemahkan

NestJS sudah mengubah error multer menjadi `HttpException` berbahasa Inggris sebelum sampai
ke exception filter, sehingga pemetaan berdasarkan kelas `MulterError` tidak pernah
tercapai. Penerjemahan karena itu dilakukan dengan mencocokkan awalan pesan, misalnya
"File too large" dan "Unexpected field", yang disimpan di `UPLOAD_ERROR_MESSAGE`.

Status 413 untuk berkas yang terlalu besar dibiarkan apa adanya, meski daftar contoh status
pada soal hanya menyebut 400, 401, 403, 404, dan 500. Daftar itu bersifat contoh, sedangkan
413 adalah status yang tepat untuk kasus ini, dan bentuk amplop responsnya tetap sama
sehingga frontend menanganinya persis seperti error lain.

## 23. Profil lokasi dikembalikan utuh, dan pembaruannya bersifat parsial

Contoh response `GET/PUT /api/admin/profile` pada soal hanya memuat `id`,
`nama_coworking`, `nama_pemilik`, dan `telp`. Kolom `alamat`, `deskripsi`, dan `foto` tetap
disertakan karena datanya memang tersimpan dan halaman profil pada frontend membutuhkannya.
Penambahan field bersifat menambah, sehingga klien yang hanya membaca keempat field pada
contoh tetap bekerja. Pola yang sama sudah dipakai sejak awal lewat `foto_url`.

Payload `PUT` mewajibkan ketiga field yang disebut soal dan menerima `alamat`, `deskripsi`,
serta `foto` sebagai opsional. Pembaruan bersifat parsial: field opsional yang tidak dikirim
dibiarkan apa adanya, bukan dikosongkan. Tanpa aturan ini, request tiga field seperti contoh
pada soal akan menghapus alamat dan deskripsi yang sudah tersimpan, dan keduanya menjadi
mustahil diubah setelah registrasi karena tidak ada endpoint lain yang menyentuhnya.

## 24. Catatan penyimpangan: `RegisterAdminSpaceDto` menerima tiga field di luar soal

`RegisterAdminSpaceDto` pada soal hanya memuat lima field: `username`, `password`,
`nama_coworking`, `nama_pemilik`, dan `telp`. Implementasi di project ini menerima tambahan
`alamat`, `deskripsi`, dan `foto`, yang ketiganya opsional dan boleh kosong di database.

Penyimpangan ini dicatat, bukan dihapus, karena ketiga kolom itu dibutuhkan halaman profil
lokasi dan tidak ada endpoint lain yang dapat mengisinya saat pendaftaran. Karena semuanya
opsional, request registrasi dengan lima field persis seperti contoh soal tetap diterima
tanpa perubahan apa pun.

## 25. Space dikembalikan dalam satu bentuk yang sama di semua endpoint

Contoh response space pada soal berbeda-beda antar endpoint: daftar menyertakan `foto_url`
tetapi tidak `deskripsi`, detail tidak menyertakan `foto_url`, dan pembuatan menyertakan
`id_owner`. Perbedaan itu tampak sebagai ketidakkonsistenan penulisan contoh, bukan aturan,
sehingga seluruh endpoint memakai satu serializer yang mengembalikan semua field.

Bentuk yang seragam membuat frontend dapat memakai ulang komponen kartu space yang sama
untuk daftar maupun detail, dan penambahan field bersifat menambah sehingga klien yang hanya
membaca field pada contoh tetap bekerja.

## 26. Space milik admin lain dibalas 404, bukan 403

Kepemilikan diperiksa sebagai bagian dari pencarian data, bukan lewat guard tersendiri,
karena barisnya memang perlu dibaca untuk diperbarui atau dihapus. Satu query dengan syarat
`id`, `id_owner`, `id_maker`, dan `deleted_at: null` sekaligus menutup empat kemungkinan:
data tidak ada, milik admin lain, milik tenant lain, atau sudah dihapus.

Keempatnya dibalas 404 "Space tidak ditemukan!", bukan 403. Membedakan "tidak ada" dari
"bukan milik Anda" akan memberi tahu admin bahwa suatu id memang ada dan dimiliki orang lain,
yang justru merupakan kebocoran informasi tanpa manfaat bagi pemakai yang sah.

## 27. Penghapusan space bersifat soft delete

Baris space tidak benar-benar dihapus, melainkan diberi `deleted_at`. Reservasi lama masih
merujuk ke space lewat `detail_reservasi`, sehingga riwayat pemesanan member dan laporan
pendapatan admin harus tetap dapat dibaca setelah sebuah space tidak lagi disewakan.

Space yang sudah dihapus hilang dari daftar, dan detail, pembaruan, maupun penghapusan
ulangnya dibalas 404, sehingga dari sisi API perilakunya sama seperti data yang benar-benar
tidak ada.

## 28. Tidak ada field `status_berlaku` pada diskon

Rencana kerja awal menyebutkan field `status_berlaku` untuk menandai promo yang sedang
aktif, tetapi field tersebut tidak muncul di mana pun pada soal: baik pada DTO, pada contoh
response panel admin, maupun pada `GET /api/diskon/active` yang justru sudah menyaring promo
aktif melalui endpointnya sendiri. Karena itu field tersebut tidak dibuat, agar cakupan
pekerjaan tetap sama dengan yang diminta.

## 29. Periode promo diperiksa setelah digabung dengan nilai tersimpan

Tanggal akhir promo harus melewati tanggal awalnya. Pada pembaruan, pemeriksaan dilakukan
setelah nilai yang dikirim digabung dengan nilai yang sudah tersimpan, karena soal
mencontohkan pembaruan yang hanya mengirim `tanggal_akhir` saja untuk memperpanjang promo.
Tanpa penggabungan itu, pembaruan sebagian tidak akan pernah dapat diperiksa kewajarannya.

## 30. Member bersifat global, bukan per admin

Berbeda dari `space` dan `diskon`, tabel `member` tidak memiliki `id_owner`, sehingga daftar
member pada panel admin mencakup seluruh member aplikasi. Ini mengikuti sifat datanya:
member mendaftar ke aplikasi, bukan ke satu lokasi coworking tertentu, dan satu member dapat
memesan space milik pengelola mana pun.

Konsekuensinya, dua admin melihat daftar member yang sama. Pada pemakaian nyata project ini
hanya ada satu pengelola, sehingga perbedaan itu tidak terasa.

## 31. Username member tidak dapat diubah admin

`UpdateMemberAdminDto` pada soal tidak memuat `username`, dan itu dipertahankan apa adanya.
Username adalah identitas login member; bila admin dapat menukarnya, admin dapat mengambil
alih akun member tanpa sepengetahuan pemiliknya. Password tetap dapat diubah admin, karena
soal mencantumkannya secara eksplisit sebagai sarana reset kata sandi.

## 32. Pencarian member memakai pencocokan `contains` biasa

Pencarian `?search=` mencocokkan nama, instansi, dan nomor telepon dengan `contains` tanpa
opsi `mode: 'insensitive'`, karena opsi tersebut hanya didukung PostgreSQL dan akan gagal di
MySQL. Pada MySQL, collation `utf8mb4_unicode_ci` sudah membuat pencocokan mengabaikan besar
kecil huruf.

Perlu diingat saat rencana pindah ke Supabase dijalankan: di PostgreSQL pencocokan ini akan
menjadi peka huruf besar kecil, sehingga perlu diganti dengan `mode: 'insensitive'` pada
saat itu.

## 33. Tipe space disimpan sebagai konstanta, bukan tabel

`GET /api/spaces/types` mengembalikan tiga tipe beserta label dan keterangannya. Ketiganya
sudah menjadi nilai enum `TipeSpace` pada skema, dan keterangannya merupakan penjelasan
kategori yang berlaku umum, bukan data milik satu pengelola. Karena itu isinya ditulis
sebagai konstanta di `src/spaces/spaces.constant.ts`, bukan tabel tambahan yang harus
di-seed dan dijaga tetap selaras dengan enumnya.

## 34. Rute tetap didaftarkan sebelum rute `:id`

`/api/spaces/availability`, `/api/spaces/types`, dan `/api/diskon/active` harus dikenali
sebelum rute `:id` pada path yang sama, karena bila tidak, "availability" akan diperlakukan
sebagai id dan ditolak sebagai bukan angka.

Untuk `types` cukup dengan urutan penulisan di dalam controller. Untuk `availability`
digunakan controller tersendiri, `AvailabilityController`, yang didaftarkan lebih dulu pada
`SpacesModule`. Pemisahan itu sekaligus wajar secara isi, karena pengecekan jadwal adalah
urusan yang berbeda dari katalog dan akan dipakai ulang saat pembuatan reservasi.

## 35. Bentrok jadwal dibalas 400, bukan `available: false`

Soal mencontohkan dua kemungkinan balasan untuk `GET /api/spaces/availability`: 200 dengan
`available: true`, atau 400 dengan pesan "Maaf, space sudah terisi atau dibooking pada jam
tersebut!". Jadi tidak ada bentuk balasan dengan `available: false`, dan ketidaktersediaan
memang disampaikan sebagai error. Bentuk itu diikuti apa adanya.

Dua jadwal dianggap bertabrakan bila yang satu mulai sebelum yang lain selesai dan selesai
setelah yang lain mulai. Jadwal yang bersambung persis, misalnya 09:00-12:00 diikuti
12:00-14:00, tidak dianggap bentrok. Reservasi berstatus `dibatalkan` melepaskan kembali
jadwalnya.

Perbandingan jamnya diserahkan ke database karena jam tersimpan sebagai `HH:mm` yang selalu
dua digit, sehingga urutan teksnya sama dengan urutan waktu. Lihat keputusan nomor 5.

## 36. Reservasi tidak boleh melewati tengah malam dan harus di dalam jam operasional

Satu baris reservasi hanya memiliki satu `tanggal_reservasi`, sehingga sewa yang melewati
tengah malam tidak dapat diwakili dan ditolak. Selain itu jam sewa harus berada di dalam
`JAM_OPERASIONAL_BUKA` sampai `JAM_OPERASIONAL_TUTUP` dari konfigurasi, karena memesan di
luar jam buka tidak masuk akal meski jadwalnya kosong.

Keduanya tidak disebut soal, tetapi merupakan akibat langsung dari bentuk datanya dan dari
adanya konfigurasi jam operasional yang sudah disiapkan sejak awal.

## 37. Kode promo yang tidak ada dan yang kedaluwarsa dibalas sama

`POST /api/diskon/check` membalas "Kode promo tidak ditemukan atau sudah kedaluwarsa!" untuk
kode yang tidak ada, yang sudah lewat, maupun yang belum mulai. Pesan gabungan itu memang
dicontohkan soal, dan sekaligus mencegah kode promo milik pengelola ditebak keberadaannya
dengan mencoba-coba, karena perbedaan pesan akan memberi tahu mana kode yang benar-benar ada.

## 38. Harga reservasi dihitung server dan disalin ke `detail_reservasi`

Tarif, potongan, dan total bayar dihitung di server dari data space dan promo yang tersimpan,
tidak pernah dari nilai kiriman klien, sehingga pemesan tidak dapat menentukan sendiri harga
yang dibayarnya.

Hasil perhitungan itu lalu disalin ke `detail_reservasi`, bukan dirujuk ke tabel space dan
diskon setiap kali ditampilkan. Dengan begitu nota dan laporan lama tetap menunjukkan harga
yang berlaku saat pemesanan meski tarif space atau persentase promonya berubah kemudian.

Potongan dibulatkan ke bawah agar tidak pernah melebihi persentase yang dijanjikan; selisihnya
paling banyak satu rupiah. Perhitungannya diuji terpisah di `src/common/utils/uang.util.spec.ts`.

## 39. Pengecekan bentrok diulang di dalam transaksi

Ketersediaan sudah diperiksa sebelum transaksi dimulai, tetapi pemeriksaan itu masih dapat
kalah balapan dengan pemesanan lain yang berjalan bersamaan pada jadwal yang sama. Karena itu
pengecekan diulang di dalam transaksi pembuatan reservasi, dan transaksinya memakai tingkat
isolasi `Serializable` agar dua pemesanan bersamaan tidak sama-sama lolos.

Konsekuensinya `AvailabilityService.adaYangBentrok` menerima `Prisma.TransactionClient`
opsional, supaya pengecekan dan penyimpanan barisnya benar-benar terjadi pada transaksi yang
sama, bukan pada dua koneksi berbeda.

## 40. Kode booking ditulis setelah baris tersimpan

Kode booking berbentuk `BOOK-YYYYMMDD-NNNN` dan memuat id barisnya sendiri, sehingga tidak
dapat disusun sebelum barisnya ada. Reservasi karena itu disimpan lebih dulu dengan kode
sementara, lalu kodenya ditulis pada langkah berikutnya di dalam transaksi yang sama, sehingga
kode sementara itu tidak pernah terlihat dari luar.

## 41. Kode promo manual didahulukan daripada promo pilihan katalog

`CreateReservasiDto` menerima `id_diskon` dan `kode_promo` sekaligus, dan soal menyebut
`kode_promo` sebagai "alternatif jika diinput manual". Bila keduanya dikirim, yang dipakai
adalah `kode_promo`, karena mengetik kode adalah tindakan terakhir pengguna pada form checkout
dan lebih mewakili maksudnya daripada promo yang sempat dipilih sebelumnya.

## 42. Pembatalan hanya untuk reservasi yang belum berjalan

Member dapat membatalkan reservasi berstatus `belum_dikonfirm` atau `disetujui`. Setelah
statusnya `aktif`, artinya member sudah check-in dan spacenya benar-benar terpakai, sehingga
pembatalan tidak lagi masuk akal dan menjadi urusan admin lewat perubahan status. Reservasi
yang sudah `selesai` atau `dibatalkan` juga ditolak.

Reservasi yang dibatalkan melepaskan kembali jadwalnya sehingga dapat dipesan orang lain, dan
tidak dihitung pada `total_pengeluaran` histori karena tidak jadi dibayar, tetapi tetap
ditampilkan pada daftar agar member dapat melihat riwayat pembatalannya.

## 43. E-ticket menyertakan gambar QR, bukan hanya payloadnya

Contoh response pada soal hanya memuat `qr_code_payload` berupa teks
`VERIFY-RESERVASI-<id>-<app_key>`, sedangkan Gambar Kerja mensyaratkan e-ticket memuat QR Code
untuk check-in. Karena itu payloadnya dikembalikan persis seperti contoh, dan ditambahkan
`qr_code_data_url` berupa gambar PNG dalam bentuk data URI.

Dengan begitu frontend dapat langsung menampilkan QR-nya tanpa memasang pustaka QR sendiri,
sementara klien yang hanya membaca `qr_code_payload` tetap bekerja seperti pada contoh.
App key ikut di dalam payload sesuai contoh soal, sehingga tiket milik satu tenant tidak dapat
diverifikasi pada tenant lain.

## 44. Perpindahan status reservasi dibatasi mesin status

Soal hanya menyebut kelima nilai status tanpa merinci urutannya. Aturan perpindahannya
disusun mengikuti alur nyata sebuah pemesanan, dan dipusatkan di
`src/admin/reservasi/status-machine.ts` supaya endpoint ubah status, check-in, dan check-out
tidak masing-masing punya versi aturannya sendiri:

- `belum_dikonfirm` menjadi `disetujui` atau `dibatalkan`
- `disetujui` menjadi `aktif`, `selesai`, atau `dibatalkan`
- `aktif` menjadi `selesai` atau `dibatalkan`
- `selesai` dan `dibatalkan` bersifat akhir

Keduanya dibuat akhir karena sudah masuk laporan pendapatan; mengembalikannya akan membuat
laporan yang sudah dicetak tidak lagi cocok dengan datanya. Pembatalan tetap mungkin selama
sewanya belum berakhir, karena admin memerlukan jalan keluar untuk pemesanan yang batal di
luar aplikasi. Perpindahan ke status yang sama juga ditolak, agar kekeliruan pemanggilan
terlihat dan bukan diam-diam dianggap berhasil.

Check-in mensyaratkan status `disetujui`, check-out mensyaratkan `aktif`, dan keduanya
mencatat waktunya agar admin dapat menelusuri kapan tamunya benar-benar datang dan pulang.
Bila `STRICT_CHECKIN_DATE` diaktifkan, check-in hanya boleh pada tanggal sewanya; bawaannya
dimatikan supaya pengujian dan demonstrasi tidak terhalang tanggal.

Aturannya diuji terpisah di `src/admin/reservasi/status-machine.spec.ts`, karena keputusannya
tidak tampak dari bentuk response.

## 45. Pesan response yang bergantung nilai memakai pembungkus tersendiri

`PATCH /api/admin/reservasi/{id}/status` membalas "Status reservasi berhasil diperbarui
menjadi disetujui", yaitu pesan yang memuat nilai hasilnya, sedangkan `@ResponseMessage`
bersifat tetap per endpoint.

Karena itu ditambahkan `ResponseDenganPesan` di `src/common/responses/pesan-dinamis.ts`.
Service membungkus hasilnya, lalu `TransformResponseInterceptor` memakai pesan tersebut dan
meneruskan `data`-nya seperti biasa, sehingga bentuk amplop responsnya tetap sama persis
dengan endpoint lain dan tidak ada jalur response kedua yang harus dipelihara.

## 46. Laporan mengabaikan reservasi batal dan selalu menampilkan ketiga tipe space

Reservasi berstatus `dibatalkan` tidak diikutkan karena tidak menghasilkan pendapatan.
Sisanya diikutkan seluruhnya, termasuk yang belum dikonfirmasi, karena justru itulah yang
membuat angkanya disebut "estimasi": pemesanan yang sudah masuk tetapi belum tentu
terealisasi. Contoh pada soal juga memperlihatkan `estimasi_pendapatan_kotor` dikurangi
`total_potongan_diskon` sama dengan `realisasi_pendapatan_bersih`, artinya keduanya dihitung
dari kumpulan baris yang sama, hanya berbeda sebelum dan sesudah potongan.

Seluruh angkanya dibaca dari `detail_reservasi` yang menyimpan harga saat pemesanan, sehingga
laporan bulan lalu tidak ikut berubah ketika tarif space dinaikkan hari ini.

`rincian_per_tipe_space` selalu memuat ketiga tipe meski nilainya nol, supaya grafik pada
frontend memiliki kategori yang tetap dan tidak berubah bentuk dari bulan ke bulan.

## 47. Tidak ada endpoint verifikasi QR maupun dashboard

Rencana kerja awal menyebutkan endpoint verifikasi QR dan dashboard admin, tetapi keduanya
tidak ada pada daftar 50 endpoint di soal. Payload QR pada e-ticket tetap dibuat sesuai
contoh, dan pemindaiannya dilakukan admin sebagai cara menemukan reservasi yang lalu
di-check-in lewat `POST /api/admin/reservasi/{id}/check-in` yang memang ada. Keduanya karena
itu tidak dibuat, sejalan dengan `status_berlaku` dan `availability/slots` yang juga tidak
ada di soal.

## 48. Seeder bersifat idempoten

`prisma/seed.ts` mencari setiap baris berdasarkan kunci alaminya lebih dulu, lalu membuatnya
bila belum ada dan menyesuaikannya bila sudah. Reservasi dikenali dari kombinasi space,
tanggal, dan jam mulainya. Dengan begitu `npm run seed` dapat dijalankan berkali-kali tanpa
menggandakan data maupun menghapus data yang sudah ada, yang penting karena seed dijalankan
pada database yang sama dengan yang dipakai mengembangkan.

Isinya 2 pengelola, 5 member, 6 space, 4 kode promo, dan 25 reservasi yang tersebar dari dua
bulan lalu sampai bulan depan dengan status bermacam-macam, supaya laporan bulanan dan histori
member langsung memiliki angka yang dapat dilihat.

## 49. Pengujian e2e memisahkan datanya lewat akhiran waktu pada nama akun

Setiap kali dijalankan, `test/alur-utama.e2e-spec.ts` membuat akun dan space dengan akhiran
`Date.now()` pada namanya, lalu di akhir hanya menghapus baris milik jalannya sendiri.
Dengan begitu pengujian tidak pernah bercampur dengan data seed maupun sisa pengujian
sebelumnya, dan dapat dijalankan berulang kali tanpa menyiapkan database khusus.
Pembersihan yang sama juga dijalankan di `beforeAll`, supaya jalan yang sebelumnya berhenti
di tengah tidak menyisakan baris yang mengganggu.

Pembersihannya dilakukan berurutan dari anak ke induk karena `reservasi` merujuk `member`
tanpa cascade, sehingga urutan penghapusan yang dipilih database sendiri dapat melanggar
foreign key tersebut. Titik awal penelusurannya adalah akun yang dibuat jalan itu, lalu
profil dan data turunannya dicari dari sana.

Urutan pengujiannya sengaja berurutan karena yang diperiksa memang alurnya: space harus ada
sebelum dapat dipesan, dan reservasi harus disetujui sebelum dapat di-check-in.

## 50. Masa berlaku promo dinilai saat pemesanan, bukan pada tanggal sewa

Sempat keliru saat menyusun data pengujian: promo dibuat berlaku pada tahun tanggal sewanya,
padahal `POST /api/diskon/check` dan pembuatan reservasi sama-sama memeriksa apakah promo
berlaku **saat ini**, bukan pada tanggal reservasinya.

Perilaku itu dipertahankan karena sejalan dengan `GET /api/diskon/active` yang menurut soal
menampilkan "promo yang sedang aktif", dan sesuai kebiasaan promo pada umumnya: yang menentukan
adalah kapan pemesanan dilakukan, bukan kapan jasanya dipakai.

## 51. Koleksi Postman diturunkan dari dokumen Swagger

`docs/postman_collection.json` tidak ditulis tangan, melainkan disusun dari dokumen OpenAPI
yang sudah dihasilkan NestJS, lewat `scripts/build-postman.ts`. Dengan begitu kedua berkas
tidak pernah berbeda isi: endpoint, parameter query, dan contoh body yang baru cukup
ditambahkan sekali pada controller dan DTO-nya.

Koleksinya memakai variabel `base_url`, `maker_key`, dan `access_token`, sehingga alamat
server dan kredensial cukup diisi sekali lalu berlaku untuk seluruh request. Contoh body
diambil dari nilai `example` pada DTO, sehingga request di Postman langsung dapat dijalankan.

## 52. Awalan `/api` dipusatkan di satu fungsi

Awalan global sempat ditulis ulang di `main.ts`, skrip ekspor dokumentasi, dan dua berkas
pengujian e2e. Akibatnya koleksi Postman pertama kali terbit tanpa `/api` karena skrip
ekspornya tidak ikut memasang awalan itu.

Pengaturannya karena itu dipindahkan ke `pasangGlobalPrefix` di `src/common/app-prefix.ts` dan
dipakai keempatnya, supaya path yang terdokumentasi, yang diuji, dan yang benar-benar dilayani
tidak dapat berbeda.

## 53. Hasil review akhir terhadap Gambar Kerja

Seluruh 50 endpoint pada tabel ringkasan soal terimplementasi, tanpa kekurangan dan tanpa
endpoint tambahan di luar daftar. Ketujuh kebutuhan Member dan kesembilan kebutuhan Admin pada
Gambar Kerja juga diperiksa satu per satu terhadap aplikasi yang berjalan dan seluruhnya
terpenuhi.

Pemeriksaan itu sekaligus membenarkan keputusan nomor 23: Gambar Kerja butir Admin nomor 3
mewajibkan admin dapat memperbarui alamat dan deskripsi fasilitas lokasinya, padahal contoh
payload `PUT /api/admin/profile` pada Kontrak API hanya memuat tiga field. Menerima keduanya
sebagai field opsional membuat kedua bagian soal terpenuhi sekaligus.

## 54. Hasil audit validasi seluruh endpoint

Seluruh endpoint diperiksa terhadap masukan yang tidak sah, dan ditemukan tujuh celah yang
kemudian diperbaiki. Pola kegagalannya sama: nilai yang tidak masuk akal lolos dari
ValidationPipe, lalu baru ditolak oleh database sebagai 500, atau tersimpan apa adanya.

**Tanggal yang tidak ada pada kalender.** `2027-02-30` lolos pemeriksaan pola `YYYY-MM-DD`,
lalu `Date.UTC` menggulungnya menjadi 2 Maret. Akibatnya reservasi tersimpan pada hari yang
tidak diminta member, pengecekan bentroknya pun dilakukan pada hari yang salah, dan kode
booking serta e-ticket ikut menyebut tanggal yang keliru. Ini yang paling berbahaya karena
tidak memunculkan error sama sekali. Diperbaiki dengan `IsTanggalWujud`, yang menyusun ulang
tanggalnya lalu memastikan hasilnya masih menunjuk hari yang sama.

**Password melebihi 72 byte.** bcrypt hanya membaca 72 byte pertama, sehingga password yang
lebih panjang diam-diam terpotong dan dua password berbeda dapat dianggap sama. Batas ini
sudah ada pada registrasi member dan admin space, tetapi terlewat pada penambahan member oleh
admin, registrasi App Maker, serta kedua endpoint login.

**Teks tanpa batas panjang.** `alamat`, `deskripsi`, `kode_promo`, dan kredensial login tidak
memiliki batas atas, sehingga kiriman 100.000 karakter melewati validasi dan baru gagal di
database sebagai 500. Kini seluruhnya dibatasi dan ditolak sebagai 400.

**Nama berkas foto.** Field `foto` menerima teks apa pun, termasuk `../../../etc/passwd` dan
URL lengkap, yang kemudian ikut disusun menjadi `foto_url`. Nilainya memang tidak pernah
dipakai membuka berkas, tetapi membiarkannya berarti menyimpan nilai yang pasti salah dan
menggantungkan keamanannya pada kode di kemudian hari. Kini dibatasi pola nama berkas polos
tanpa garis miring maupun titik ganda.

**Parameter pencarian tanpa DTO.** `GET /api/admin/members` membaca `?search` langsung lewat
`@Query('search')`, sehingga tidak pernah melewati ValidationPipe. Nilai berbentuk array atau
objek seperti `?search[]=a` diterima dan penyaringannya diam-diam diabaikan. Kini memakai
`ListMembersQueryDto`.

Yang sudah benar sejak awal dan tidak diubah: penolakan tipe data yang salah, bilangan pecahan
pada field bilangan bulat, enum di luar daftar, field asing pada body maupun query, id bukan
angka, body yang bukan JSON, serta pemeriksaan kepemilikan data setelah validasi lolos.
Pencemaran prototype lewat `__proto__` juga diuji dan tidak terjadi.

## 55. Perbaikan bug: kode promo kini terikat pengelola penerbitnya

Ditemukan saat menyusun rencana frontend. Promo hanya difilter `id_maker`, tidak pernah
`id_owner`, baik pada katalog maupun pada validasi saat memesan. Akibatnya **promo terbitan
satu pengelola dapat dipakai untuk memesan space milik pengelola lain**, dan backend
menerimanya. Pada data seed hal itu benar-benar terjadi: dua reservasi memakai
`DISKONHEMAT20` milik Moklet Hub untuk memesan space milik Ruang Kolaborasi.

Ini diperbaiki sebagai **perubahan perilaku yang disengaja**, bukan penambahan, karena
membiarkannya berarti pengelola menanggung potongan harga yang tidak pernah ia tawarkan.

- Pencarian promo pada pembuatan reservasi, lewat `id_diskon` maupun `kode_promo`, kini
  difilter `id_maker` **dan** `id_owner` space yang dipesan. Dengan begitu kode yang sama
  diterbitkan dua pengelola tidak pernah tertukar, dan yang dipakai selalu milik pengelola
  space tersebut.
- Promo milik pengelola lain ditolak 400 dengan pesan tersendiri,
  "Kode promo tidak berlaku untuk space ini". Dibedakan dari promo yang memang tidak ada atau
  sudah lewat, karena pengguna sudah melihat kodenya di suatu tempat dan pantas tahu bahwa
  masalahnya ada pada space yang ia pilih.
- `serializeDiskon` menyertakan `id_owner`. Bersifat menambah.
- `GET /api/diskon/active` menerima query opsional `?id_space`. Bila diisi, hanya promo milik
  pengelola space tersebut yang dikembalikan; tanpa query, perilaku lama dipertahankan.
- `POST /api/diskon/check` menerima field opsional `id_space`. Bila diisi, kepemilikan ikut
  diperiksa sehingga hasil pengecekan di halaman checkout sama persis dengan yang nanti
  diterapkan saat memesan.
- Seeder diperbaiki: setiap space dipasangkan dengan promo milik pengelolanya sendiri.
  Sebagai efek sampingnya `NUSANTARA15` kini benar-benar terpakai, sehingga data contoh
  mewakili kedua pengelola.

Frontend memanggil `/api/diskon/active?id_space=<id>` pada form pemesanan dan mengirim
`id_space` ke `/api/diskon/check`, sehingga daftar promo yang ditawarkan sudah tersaring
sebelum pengguna memilih.

Setelah keputusan 56, filter `id_maker` pada poin pertama tidak ada lagi; penyaringnya kini
hanya `id_owner`, yang memang sejak awal merupakan bagian yang memperbaiki bug ini.

## 56. App Maker ditiadakan karena bukan bagian dari paket Fullstack

Seluruh mekanisme App Maker dibuang: model `Maker`, kolom `id_maker` pada enam tabel,
`src/maker/`, `MakerContextGuard` beserta decorator pendampingnya, header `x-maker-key`, dan
kelima endpoint `/api/maker/*`. `users.username` dan `reservasi.kode_booking` dikembalikan
menjadi unik global lewat migrasi
`20260917000000_remove_app_maker_multi_tenancy`.

Alasannya ada pada pembagian paket soal itu sendiri. Lampiran B (Backend) yang mewajibkan
"seluruh endpoint pada Kontrak API (Bagian III)", dan Kontrak API itulah yang memuat App
Maker. Lampiran A (Fullstack), yaitu paket yang dikerjakan project ini, merujuk Bagian II
(Gambar Kerja) saja. Jadi App Maker adalah kewajiban paket Backend, bukan paket Fullstack.
Sebelumnya fitur itu dibuat karena Kontrak API dibaca sebagai berlaku untuk semua paket.

Konsekuensi yang perlu dicatat:

- Jumlah endpoint turun dari 50 menjadi 45. Yang hilang seluruhnya `/api/maker/*`, dan tidak
  ada endpoint Gambar Kerja yang ikut terbuang.
- Isolasi data antar pengelola kini sepenuhnya bertumpu pada `id_owner`, yang memang sudah
  ada sejak awal pada `space`, `diskon`, dan `reservasi`. Karena lapisan di atasnya hilang,
  pemisahan itu diuji langsung pada pengujian e2e nomor 13, yang memastikan pengelola kedua
  tidak melihat maupun dapat mengubah data pengelola pertama.
- `JwtStrategy` menjadi jauh lebih sederhana: tidak lagi memerlukan `passReqToCallback`,
  tidak memeriksa klaim `type`, dan tidak mencocokkan tenant. Yang tersisa adalah pembacaan
  ulang akun dan penolakan member yang sudah di-soft-delete (keputusan 15).
- Payload QR e-ticket berubah dari `VERIFY-RESERVASI-<id>-<app_key>` menjadi
  `VERIFY-RESERVASI-<id>`, karena id reservasi kini sudah unik secara global.
- Frontend tidak lagi menyimpan `NEXT_PUBLIC_APP_KEY` maupun mengirim header `x-maker-key`.

## 57. Foto dapat disimpan di Cloudinary tanpa mengubah isi database

Disk layanan hosting seperti Railway dikosongkan setiap kali deploy, sehingga foto di folder
`uploads/` akan hilang. Karena itu foto kini dapat disimpan di Cloudinary, dipilih cukup
dengan mengisi `CLOUDINARY_URL`. Bila variabel itu kosong, foto tetap ditulis ke `uploads/`
seperti sebelumnya, sehingga pengembangan dan pengujian tidak memerlukan koneksi internet.

Kolom `foto` pada `space`, `member`, dan `space_owner` tetap berisi **nama berkas saja**,
bukan URL. Nama itu dipakai sebagai public_id Cloudinary
(`<CLOUDINARY_FOLDER>/<folder>/<nama tanpa ekstensi>`), dan URL-nya dibentuk dengan
`buildFotoUrl` yang sama dari awalan `foto.baseUrl`:

- lokal: `<APP_URL>/uploads/spaces/<nama>`
- Cloudinary: `https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto/<folder induk>/spaces/<nama>`

Dengan begitu tidak ada migrasi database, dan response upload tetap `{ filename, url }`
sesuai kontrak. Multer kini menahan berkas di memori (batasnya hanya 2 MB), karena
decorator `FileInterceptor` dievaluasi sebelum konfigurasi termuat dan tidak dapat memilih
tujuan penyimpanan. Pemilihannya dilakukan di `UploadService`.

Foto yang sudah ada di `uploads/`, termasuk foto contoh seeder, dipindahkan dengan
`npm run foto:migrasi-cloudinary`. Skrip itu mempertahankan nama berkas dan tidak menimpa
foto yang sudah ada, sehingga aman dijalankan berulang. Kegagalan unggah ke Cloudinary
dijawab 503 dengan pesan umum, dan rinciannya hanya dicatat di log.
