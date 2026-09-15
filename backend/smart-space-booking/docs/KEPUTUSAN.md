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

## 14. JwtAuthGuard dipasang global, endpoint tertutup secara bawaan

Guard autentikasi dipasang sebagai `APP_GUARD`, lalu endpoint yang memang publik
ditandai `@Public()`. Pilihan ini diambil agar kesalahan yang paling mudah terjadi, yaitu
lupa memasang guard pada endpoint baru, berakibat endpoint tertutup dan langsung terlihat
saat dicoba, bukan endpoint terbuka yang diam-diam dapat diakses siapa saja.

Urutan pendaftaran guard penting: `MakerContextGuard` didaftarkan lebih dulu agar tenant
sudah menempel pada request sebelum `JwtStrategy` mencocokkan token dengan tenant tersebut.

## 15. Token diperiksa terhadap tenant yang aktif pada request

`JwtStrategy` menolak token bila `id_maker` pemilik token berbeda dengan tenant yang sedang
aktif. Tanpa pemeriksaan ini, token yang sah dari satu app key masih dapat dipakai sambil
mengirim header app key milik tenant lain, sehingga isolasi data dapat ditembus tanpa perlu
menebak password siapa pun.

Akun juga dibaca ulang dari database pada setiap request, bukan dipercaya dari isi token,
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
profil hanya memuat kunci yang relevan dengan role pengguna, tanpa `maker_id` dan tanpa
kunci lawannya yang bernilai null, sedangkan login memuat `maker_id` beserta kedua kunci.

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
rusak, kedaluwarsa, milik akun yang sudah dihapus, milik akun maker, maupun milik tenant
lain. Membedakannya akan memberi petunjuk yang berguna bagi yang mencoba-coba, sedangkan
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

## 30. Member bersifat per tenant, bukan per admin

Berbeda dari `space` dan `diskon`, tabel `member` tidak memiliki `id_owner`, sehingga daftar
member pada panel admin mencakup seluruh member pada tenant yang sama. Ini mengikuti sifat
datanya: member mendaftar ke aplikasi, bukan ke satu lokasi coworking tertentu, dan satu
member dapat memesan space milik pengelola mana pun.

Konsekuensinya, dua admin pada tenant yang sama melihat daftar member yang sama. Pada
pemakaian nyata project ini hanya ada satu tenant dengan satu pengelola, sehingga perbedaan
itu tidak terasa.

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
