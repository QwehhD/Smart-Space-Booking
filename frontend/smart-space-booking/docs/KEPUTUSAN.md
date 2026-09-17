# Catatan Keputusan Frontend

Dokumen ini mencatat keputusan dan perbedaan yang ditemukan saat membangun
frontend, termasuk hal-hal yang berbeda dari dokumen rencana maupun dari
wireframe pada soal.

Urutan acuan yang dipakai: kode backend, lalu `backend/docs/KEPUTUSAN.md`, lalu
dokumen rencana, lalu PDF soal.

## 1. Struktur folder tanpa `src/`

Dokumen rencana menggambarkan `frontend/src/app`, sedangkan scaffold
`create-next-app` yang sudah ada menempatkan `app/`, `lib/`, dan `types/`
langsung di akar, dengan alias `@/*` yang menunjuk ke akar itu. Struktur yang ada
dipertahankan agar alias tidak perlu diubah dan riwayat berkas tetap utuh.

## 2. `NEXT_PUBLIC_API_URL` sudah memuat `/api`

Klien axios yang dibuat sebelumnya menambahkan sendiri awalan `/api` ke
`NEXT_PUBLIC_API_URL`, sedangkan dokumen rencana menetapkan variabel itu sudah
memuat `/api`. Konvensi dokumen rencana yang dipakai, dan kliennya disesuaikan:
`baseURL` kini memakai nilai env apa adanya, dan path pada setiap fungsi domain
ditulis tanpa awalan tersebut.

## 3. Tipe entitas diturunkan dari serializer backend, bukan dari Swagger

`backend/docs/swagger.json` tidak memuat skema response sama sekali: nol dari
seluruh endpoint mendokumentasikan bentuk balasannya, karena tidak ada satu pun endpoint
yang memakai `@ApiOkResponse` dengan tipe. Yang terdokumentasi hanya path,
parameter, body, dan autentikasi.

Karena itu seluruh tipe di `types/entities.ts` disalin dari
`backend/src/common/serializers/`, yang merupakan bentuk yang benar-benar
dikirim. Contoh pada PDF soal tidak dipakai sebagai acuan karena berbeda-beda
antar endpoint untuk entitas yang sama.

## 4. shadcn/ui memakai Base UI, bukan Radix

Versi shadcn/ui yang terpasang memakai `@base-ui/react`, bukan `@radix-ui/*`.
Dua akibat yang perlu diingat saat menulis komponen:

- Tidak ada `asChild`. Untuk menjadikan tombol sebagai tautan, dipakai prop
  `render`, misalnya `<Button render={<Link href="/x">Teks</Link>} />`.
- Tidak ada komponen `Slot`. `FormControl` karena itu menempelkan atributnya ke
  elemen anak lewat `React.cloneElement`.

Fungsi `cn` juga berasal dari paket `cn` milik shadcn, bukan dari kombinasi
`clsx` dan `tailwind-merge`. `lib/utils.ts` hanya meneruskannya.

## 5. `components/ui/form.tsx` ditulis sendiri

`npx shadcn add form` selesai tanpa error tetapi tidak menghasilkan berkas apa
pun. Daripada bergantung pada perilaku CLI yang diam, komponennya ditulis sendiri
dengan isi yang setara: `FormField`, `FormItem`, `FormLabel`, `FormControl`,
`FormDescription`, dan `FormMessage`, yang menyambungkan `htmlFor`,
`aria-describedby`, dan `aria-invalid` lewat satu id bersama.

## 6. Notifikasi tidak memakai `next-themes`

Berkas `sonner.tsx` bawaan shadcn mengambil tema dari `next-themes`. Aplikasi ini
tidak menyediakan pengalih tema, dan seluruh warnanya sudah ditentukan token CSS
yang ikut berubah sendiri pada mode gelap, sehingga ketergantungan itu dilepas
dan temanya dibiarkan mengikuti sistem.

## 7. Palet netral dengan satu warna aksen

Basis warna dari shadcn seluruhnya netral tanpa kroma, yang sudah sesuai nuansa
abu-abu pada wireframe. Yang ditambahkan hanya satu warna aksen petrol pada
`--primary` dan `--ring`, lima pasang warna status, serta lima warna grafik.

Warna status ditentukan sebagai pasangan teks dan latar sekaligus agar kontrasnya
terjaga di kedua tema, dan hanya dipakai lewat komponen `StatusBadge`, sehingga
satu status tidak pernah tampil berbeda antar halaman.

## 8. Pencarian reservasi admin disaring di sisi klien

`GET /api/admin/reservasi` hanya menerima `month`, `year`, `status`, `id_space`,
dan `tanggal`. Tidak ada parameter pencarian kode booking maupun nama member, dan
tidak ada filter `id_member`.

Karena itu pencarian pada halaman daftar reservasi admin, dan riwayat reservasi
pada halaman detail member, disaring di sisi klien dari data yang sudah dimuat.
Endpoint baru tidak ditambahkan agar cakupan backend tetap sama dengan soal.

## 9. Promo disaring per pengelola space

Ditemukan saat menyusun rencana frontend bahwa promo hanya difilter tenant, tidak
pernah pemilik, sehingga promo satu pengelola dapat dipakai pada space pengelola
lain. Ini diperbaiki di backend sebagai perubahan perilaku yang disengaja; lihat
`backend/docs/KEPUTUSAN.md` nomor 55.

Akibatnya bagi frontend: form pemesanan memanggil
`GET /api/diskon/active?id_space=<id>` dan mengirim `id_space` pada
`POST /api/diskon/check`, sehingga daftar promo yang ditawarkan sudah tersaring
sebelum pengguna memilih.

## 10. Tanggal polos tidak pernah melewati konstruktor `Date`

Backend mengirim tanggal sewa sebagai teks `YYYY-MM-DD` tanpa zona waktu.
`new Date('2026-08-30')` menafsirkannya sebagai tengah malam UTC lalu menggesernya
ke zona lokal saat diformat, yang untuk zona di sebelah barat UTC mundur satu
hari. Karena itu seluruh fungsi di `lib/format.ts` memecah tanggal menjadi
komponennya sendiri, dan perbandingan antar tanggal dilakukan sebagai
perbandingan teks, sama seperti yang dilakukan backend terhadap jam.

Perhitungan "hari ini" dan "jam sekarang" memakai `Intl.DateTimeFormat` dengan
`timeZone: 'Asia/Jakarta'`, sehingga tetap benar meski peramban pengguna berada
di zona lain.

## 11. Sesi disimpan di cookie yang dapat dibaca JavaScript

Token dan role disimpan pada cookie `ssb_token` dan `ssb_role`, bukan di
`localStorage`, supaya `proxy.ts` dan Server Component dapat membacanya sebelum
halaman dirender. Tanpa itu, proteksi route hanya bisa dilakukan setelah halaman
yang salah sempat tampil.

Konsekuensi keamanannya perlu dicatat dengan jujur: cookie ini **tidak dapat**
`httpOnly`, karena diisi oleh kode peramban setelah login dan dibaca lagi oleh
klien axios. Artinya skrip apa pun yang berhasil berjalan di halaman ini dapat
membacanya, sehingga perlindungan terhadap XSS bergantung pada React yang
melakukan escaping secara bawaan dan pada tidak adanya `dangerouslySetInnerHTML`
di aplikasi ini.

Cara yang lebih aman adalah menyimpan token pada cookie `httpOnly` yang dipasang
server, misalnya lewat Route Handler yang meneruskan login ke backend. Itu tidak
ditempuh karena menambah satu lapisan proksi di depan seluruh endpoint
terautentikasi, sementara aplikasi ini dijalankan lokal untuk keperluan ujian.

Atribut lain tetap dipasang: `SameSite=Lax` menahan pengiriman lintas situs pada
navigasi berbahaya, `Secure` aktif otomatis saat halaman diakses lewat HTTPS, dan
`Max-Age` diambil dari klaim `exp` token sehingga cookie tidak pernah hidup lebih
lama daripada tokennya sendiri. Token yang bentuknya tidak terbaca diberi masa
berlaku bawaan satu hari, bukan dianggap gagal.

## 12. Proteksi route memakai `proxy.ts`, bukan `middleware.ts`

Next.js 16 menandai `middleware.ts` sebagai deprecated dan menggantinya dengan
`proxy.ts`; fungsinya sama, hanya nama berkas dan nama ekspornya yang berubah.
Dokumentasi yang terpasang di `node_modules/next/dist/docs` dipakai sebagai acuan,
bukan kebiasaan dari versi sebelumnya.

Pemeriksaan di sana hanya melihat ada tidaknya cookie sesi dan rolenya, bukan
memvalidasi tokennya. Keabsahan token tetap ditentukan backend pada setiap
request. Tujuan lapisan ini adalah mencegah halaman yang salah sempat tampil,
bukan menjadi satu-satunya penjaga.

Matcher-nya mengecualikan `_next/static`, `_next/image`, favicon, dan berkas
gambar. Tanpa pengecualian itu proxy ikut berjalan untuk setiap aset dan dapat
menghalangi CSS maupun gambar.

## 13. Daftar menu tidak dilewatkan sebagai prop dari layout

Setiap item navigasi memuat komponen ikon dari lucide. Komponen adalah fungsi,
dan fungsi tidak dapat dilewatkan dari Server Component ke Client Component;
build gagal dengan "Functions cannot be passed directly to Client Components".

Karena itu `BottomNav` menerima `varian` berupa teks dan mengimpor sendiri daftar
menunya. Layout hanya menentukan varian mana yang dipakai.

## 14. Cookie dibaca lewat `useSyncExternalStore`

Pola lama untuk menghindari ketidakcocokan hidrasi adalah menyalakan penanda
"sudah terpasang" di dalam `useEffect`. Lint React 19 menolaknya karena memanggil
`setState` secara sinkron di dalam effect dapat memicu render berantai.

Cookie adalah sumber di luar React, sehingga dibaca dengan primitif yang memang
disediakan untuk itu. Snapshot untuk server sengaja mengembalikan nilai kosong,
sehingga render pertama di server dan di klien sama dan hidrasinya tidak bentrok.

## 15. Satu endpoint login, dua halaman, dan role yang tidak cocok ditolak

Backend hanya menyediakan satu `POST /api/auth/login` untuk kedua role, sehingga
yang membedakan adalah halamannya. Bila role hasil login tidak cocok dengan
halaman yang dibuka, sesinya sengaja **tidak disimpan** dan pengguna diberi tahu
harus masuk lewat halaman yang mana.

Membiarkannya masuk berarti pengguna berada di panel yang bukan haknya lalu
ditolak satu per satu oleh backend pada setiap tindakan, yang jauh lebih
membingungkan daripada satu pesan yang jelas di awal.

Setelah registrasi, backend sudah mengembalikan `access_token`, sehingga sesinya
langsung dipasang tanpa meminta pengguna login ulang.

## 16. Katalog dirender di server

`/spaces` dan `/spaces/[id]` dibuat sebagai Server Component dan tidak
memerlukan login. Ada tiga alasan:

Pertama, kategori Fullstack pada soal menyebut "web utuh (server-side
rendering)", sehingga perlu ada bagian aplikasi yang benar-benar dirender di
server, bukan sekadar kerangka yang diisi JavaScript.

Kedua, hasil pencarian dan penyaringan menjadi dapat ditautkan: seluruh filter
disimpan pada URL, bukan pada state komponen, sehingga tautannya dapat dibagikan,
disimpan sebagai bookmark, dan bertahan saat halaman dimuat ulang.

Ketiga, pengunjung dapat menelusuri katalog sebelum mendaftar, yang masuk akal
untuk aplikasi pemesanan.

Komponen penyaringnya tetap Client Component, karena harus menanggapi ketikan,
tetapi tugasnya hanya mengubah URL. Halaman katalognya yang membaca URL itu dan
mengambil datanya di server.

## 17. Status 404 pada halaman detail adalah 200 karena responsnya streamed

`notFound()` pada `/spaces/[id]` menampilkan halaman tidak-ditemukan dengan
benar, tetapi status HTTP-nya 200, bukan 404. Ini **perilaku Next.js yang
terdokumentasi**, bukan kekeliruan implementasi: dokumentasi `not-found.js` versi
terpasang menyatakan Next mengembalikan 200 untuk respons yang di-stream dan 404
untuk yang tidak. Halaman ini di-stream karena memiliki `loading.tsx`.

Mitigasi bawaannya sudah diverifikasi berjalan: Next menyisipkan
`<meta name="robots" content="noindex">` pada respons tidak-ditemukan, dan tag
itu tidak muncul pada halaman yang sah, sehingga mesin pencari tidak
mengindeksnya meski statusnya 200.

Dokumentasi menawarkan jalan keluar bila status 404 benar-benar dibutuhkan, yaitu
memeriksa keberadaan sumber daya di `proxy.ts` sebelum badan respons dikirim.
Itu tidak ditempuh karena berarti memanggil backend dari proxy untuk setiap
pembukaan detail, sedangkan dokumentasinya sendiri menyarankan pemeriksaan di
proxy tetap ringan dan tanpa pengambilan konten. Route yang memang tidak ada
tetap membalas 404 sebagaimana mestinya.

## 18. Detail space mengambil datanya satu kali lewat `cache`

`generateMetadata` dan komponen halaman sama-sama membutuhkan data space.
Keduanya memanggil satu fungsi yang dibungkus `cache` dari React, sehingga
backend hanya dipanggil sekali per request dan judul halaman tidak pernah berbeda
dari isinya.

Fungsi itu juga yang menangani id tidak valid: id bukan bilangan bulat positif dan
space yang tidak ditemukan sama-sama menghasilkan null, lalu halaman
memanggil `notFound()`. Dengan begitu bentuk id yang salah tidak pernah sampai ke
backend.

## 19. Tombol pesan pada detail menyesuaikan role dari server

Role dibaca dari cookie di server, sehingga tombol "Pesan Sekarang" hanya muncul
untuk pengunjung dan member. Pengelola melihat keterangan bahwa pemesanan hanya
dapat dilakukan dari akun member, tanpa perlu menunggu JavaScript dan tanpa
tombol yang berkedip lalu berubah.

Pengunjung yang belum masuk tetap melihat tombolnya. Saat diklik, proxy
mengalihkannya ke halaman login beserta alamat tujuannya, sehingga setelah masuk
ia kembali ke form pemesanan space yang sama.

## 20. Ketersediaan diperiksa ke backend, bukan disimpulkan di klien

Setiap perubahan tanggal, jam, atau durasi memicu pemanggilan
`GET /api/spaces/availability` setelah jeda singkat. Tombol lanjut baru aktif
ketika backend menyatakan jadwalnya kosong.

Alternatifnya adalah mengunduh seluruh reservasi space itu lalu memeriksa
tumpang tindih di klien. Itu tidak ditempuh karena backend tidak menyediakan
endpoint untuk mengambil jadwal satu space, dan karena jadwal dapat terisi orang
lain kapan saja; satu-satunya jawaban yang dapat dipercaya adalah jawaban
backend saat itu juga. Hasil pengecekannya karena itu tidak disimpan di cache.

Nilai yang dipakai memeriksa sengaja tertunda, sedangkan ringkasan harga tetap
mengikuti nilai terkini, supaya tampilan terasa responsif tanpa mengirim satu
request per perubahan.

## 21. Pratinjau harga dihitung ulang di klien, tetapi hasil akhirnya dari backend

`lib/pricing.ts` menyalin rumus `backend/src/common/utils/uang.util.ts`, termasuk
pembulatan potongan ke bawah, sehingga angka yang terlihat sebelum memesan sama
dengan yang nanti ditagihkan. Kesamaannya diperiksa terhadap backend yang
berjalan: 20.000 per jam selama 3 jam dengan promo 20 persen menghasilkan
subtotal 60.000, potongan 12.000, dan total 48.000 pada kedua sisi.

Setelah pemesanan berhasil, angka yang ditampilkan diambil dari response backend,
bukan dari perhitungan pratinjau. Dengan begitu yang dibaca pengguna selalu yang
benar-benar tersimpan, meski suatu saat rumusnya berbeda.

## 22. Pilihan jam dan durasi dibatasi jam operasional

Jam mulai yang ditawarkan berhenti satu jam sebelum tutup, karena durasi
minimalnya satu jam. Bila tanggal yang dipilih adalah hari ini, jam yang sudah
lewat dibuang. Durasi maksimalnya adalah sisa jam sampai tutup, sehingga satu
reservasi tidak pernah melewati tengah malam.

Ketika jam mulai berubah, durasi yang terlanjur terpilih ikut dipangkas bila
melewati jam tutup; dan ketika tanggal berubah ke hari ini, jam yang sudah lewat
diganti dengan pilihan terdekat. Tanpa keduanya, form dapat berada pada keadaan
yang pasti ditolak backend.

Nilai jam operasionalnya berasal dari env frontend dan harus sama dengan env
backend. Yang menentukan tetap backend; pembatasan di sini hanya mencegah
pengguna memilih sesuatu yang sudah pasti gagal.

## 23. Promo disaring per space sejak daftarnya dimuat

Daftar promo diambil dengan `?id_space`, dan kode manual dikirim beserta
`id_space`. Keduanya memakai penyaringan pemilik yang ditambahkan ke backend,
sehingga promo terbitan pengelola lain tidak pernah ditawarkan maupun diterima.
Diverifikasi terhadap data seed: space milik Moklet Hub menawarkan dua promo,
space milik Ruang Kolaborasi menawarkan satu, dan memakai kode milik pengelola
lain dibalas "Kode promo tidak berlaku untuk space ini".

Dua cara memilih promo tidak pernah aktif bersamaan. Memilih dari katalog
mengirim `id_diskon`, mengetik kode mengirim `kode_promo`, dan promo yang sudah
dipakai dapat dilepas kembali.

## 24. Form pemesanan memakai `useWatch`, bukan `form.watch`

React Compiler melewati memoisasi seluruh komponen yang memanggil `form.watch()`,
karena fungsi yang dikembalikannya tidak dapat dimemoisasi dengan aman. Lint
memperingatkan hal itu. `useWatch` berlangganan per field dan tidak memicu
peringatan tersebut, sehingga dipakai untuk ketiga nilai yang diamati form.

## 25. Detail reservasi disusun dari dua endpoint

`GET /api/reservasi/{id}` hanya memuat `total_bayar`, tanpa rincian potongan, dan
tidak memuat data pengelola sama sekali. Keduanya dibutuhkan halaman detail.

Endpoint e-ticket memuat keduanya, yaitu `rincian_pembayaran` dan
`coworking_space`, sehingga halaman detail memanggil keduanya. Pengambilan
e-ticket dibuat bersifat pelengkap: bila gagal, halaman tetap tampil dengan data
yang ada dan hanya kehilangan rincian tambahannya. Dengan begitu satu kegagalan
tidak menjatuhkan seluruh halaman.

Endpoint baru tidak diminta ke backend karena datanya sudah dapat disusun dari
yang tersedia.

## 26. Waktu check-in dan check-out belum dapat dilihat member

Dokumen rencana meminta halaman detail reservasi menampilkan waktu check-in dan
check-out bila ada. Data itu **tidak dikembalikan endpoint mana pun yang dapat
diakses member**: `serializeReservasiDetail` tidak memuatnya, dan hanya
`serializeReservasiAdmin` yang punya `check_in_time` serta `check_out_time`.

Berbeda dengan data pengelola dan rincian harga, ini tidak dapat disusun dari
endpoint lain. Bagian tersebut karena itu belum dibuat, dan dicatat di sini
sebagai kekurangan yang disengaja, bukan kelalaian.

Bila nanti diputuskan perlu, perubahannya bersifat menambah dan kecil: menyalin
dua field itu ke `serializeReservasiDetail` di backend.

## 27. Tab status disaring di klien

`GET /api/reservasi/my` tidak menerima parameter status, dan seluruh pemesanan
satu member memang dimuat sekaligus dalam satu response. Karena itu tab status
menyaring data yang sudah ada di klien, bukan memanggil ulang backend, dan jumlah
per status dapat ditampilkan pada tabnya tanpa request tambahan.

Tab yang sedang aktif tetap disimpan pada URL supaya dapat ditautkan.

## 28. Cetak memakai dialog peramban, bukan pustaka PDF

Tombol cetak memanggil `window.print()`, dan tata letaknya diatur stylesheet
`@media print` yang menyembunyikan seluruh halaman kecuali elemen bertanda
`.cetak-tiket` atau `.cetak-laporan`. Dengan begitu navigasi dan tombol tidak
ikut tercetak, dan pengguna dapat memilih "Simpan sebagai PDF" dari dialog cetak.

Pustaka pembuat PDF tidak dipakai karena akan menambah beban unduhan yang cukup
besar untuk hasil yang justru kurang setia terhadap tampilan aslinya.

## 29. Berbagi tiket memakai Web Share API dengan cadangan salin tautan

`navigator.share` hanya tersedia pada sebagian peramban, terutama di perangkat
mobile. Bila tidak ada, tautan tiket disalin ke papan klip dan pengguna diberi
tahu lewat notifikasi. Pembatalan dialog berbagi oleh pengguna sengaja tidak
diperlakukan sebagai kegagalan.

## 30. Halaman akun hanya dapat dibaca

Backend tidak menyediakan endpoint bagi member untuk mengubah profilnya sendiri;
perubahan data member dilakukan pengelola lewat `/api/admin/members`. Halaman akun
karena itu tidak memiliki form, dan menyebutkan bahwa perubahan data dilakukan
melalui pengelola.

## 31. App key dibuang mengikuti keputusan 56 di backend

`NEXT_PUBLIC_APP_KEY` dan header `x-maker-key` dihapus dari klien axios, dari
`.env.example`, dan dari `.env.local`, karena backend meniadakan seluruh mekanisme
App Maker (lihat `backend/docs/KEPUTUSAN.md` nomor 56). Alasannya ada pada
pembagian paket soal: App Maker adalah kewajiban Lampiran B (Backend), sedangkan
project ini mengerjakan Lampiran A (Fullstack) yang merujuk Gambar Kerja saja.

Akibatnya frontend kini tidak memerlukan konfigurasi apa pun selain alamat
backend dan jam operasional. Field `maker_id` juga dibuang dari tipe `HasilLogin`.

Keputusan 2 sebelumnya mencatat penggantian nama `NEXT_PUBLIC_MAKER_KEY` menjadi
`NEXT_PUBLIC_APP_KEY`; catatan itu ikut dihapus karena variabelnya sudah tidak ada.

## 32. Dashboard dirangkai dari endpoint yang sudah ada, bukan endpoint baru

Backend tidak menyediakan endpoint dashboard (lihat `backend/docs/KEPUTUSAN.md`
nomor 47), dan mengarang endpoint baru tidak diperbolehkan. Karena itu
`/admin/dashboard` menyusun sendiri angkanya dari empat sumber yang sudah ada:
`GET /admin/reports/monthly` untuk pendapatan bulan berjalan,
`GET /admin/reservasi?tanggal=<hari ini>` untuk agenda,
`GET /admin/reservasi?status=belum_dikonfirm` untuk antrean persetujuan, dan
`GET /admin/spaces` untuk jumlah ruangan. Nama lokasi pada sapaan diambil dari
`GET /admin/profile`, yang memang sudah dimuat halaman profil.

Kelimanya diminta serentak dengan `Promise.all`, sehingga waktu muat halaman
ditentukan permintaan paling lama, bukan jumlah seluruhnya.

Agenda diurutkan ulang di klien berdasarkan `jam_mulai`. Backend mengurutkan
daftar reservasi dari yang terbaru dibuat, sedangkan yang berguna bagi pengelola
adalah urutan jam kedatangan tamu.

## 33. Baris pada dashboard hanya menautkan, tidak menyediakan aksi sendiri

Agenda dan antrean konfirmasi pada dashboard menampilkan data saja, lalu
menautkan ke `/admin/reservasi`. Persetujuan, pembatalan, dan check-in sengaja
tidak diduplikasi di sini supaya aturan perpindahan status hanya perlu dijaga di
satu tempat. Bila tombolnya ada di dua halaman, keduanya harus diperbarui setiap
kali mesin status berubah, dan yang terlupa akan menampilkan tombol yang pasti
ditolak backend.

## 34. Field opsional yang dikosongkan tidak dikirim, dan akibatnya tidak dapat dikosongkan

`UpdateProfileDto` di backend menetapkan `alamat` minimal 3 karakter dan
`deskripsi` minimal 3 karakter ketika field itu ada. Mengirim string kosong
karena itu ditolak 400, bukan mengosongkan nilainya.

Form profil lokasi menanganinya dengan menganggap kekosongan sebagai sah di
tingkat validasi klien, lalu menyaring field kosong saat menyusun payload.
Konsekuensinya alamat dan deskripsi yang sudah terisi hanya dapat diganti
isinya, tidak dapat dikosongkan kembali lewat form. Ini diterima apa adanya
karena mengosongkannya bukan tindakan yang masuk akal bagi data yang tampil di
katalog publik, dan menambah endpoint atau field baru untuk itu tidak
diperbolehkan.

Perlu dicatat pula bahwa `z.preprocess` tidak dipakai untuk mengubah string
kosong menjadi `undefined`, meski itu cara yang paling langsung. Preprocess
membuat tipe masukan skema menjadi `unknown`, sehingga `zodResolver` tidak lagi
cocok dengan tipe form react-hook-form dan TypeScript menolaknya. Yang dipakai
adalah `refine` biasa yang mempertahankan tipe `string`.

## 35. Tombol simpan hanya aktif ketika ada perubahan

Form profil lokasi memakai `formState.isDirty` untuk mengunci tombol simpan dan
tombol batalkan. Setelah penyimpanan berhasil, form disetel ulang dengan nilai
yang dikembalikan server, bukan nilai yang diketik, sehingga penanda perubahan
hilang dan yang tampil benar-benar yang tersimpan. `router.refresh()` dipanggil
setelahnya karena halaman ini dirender di server dan nama lokasi ikut tampil
pada sapaan dashboard serta katalog publik.

## 36. Daftar master data memakai data server sebagai `initialData` TanStack Query

Ketiga halaman master data mengambil daftarnya di Server Component, lalu
menyerahkannya ke komponen klien sebagai `initialData`. Dengan begitu isinya
sudah terlihat pada render pertama tanpa kedipan keadaan kosong, sekaligus
berada di cache TanStack Query sehingga setiap penambahan, perubahan, dan
penghapusan cukup membatalkan kuncinya, bukan memuat ulang seluruh halaman.

Mutasi pada space dan diskon juga membatalkan kunci publiknya (`qk.spaces.all`
dan `qk.diskon.all`), karena data yang sama tampil di katalog dan di daftar promo
yang dilihat member.

## 37. Satu dialog untuk tambah dan ubah, kecuali member

Space dan diskon memakai satu komponen dialog untuk menambah dan mengubah,
karena payload keduanya identik dan yang berbeda hanya endpoint tujuannya.
Menyatukannya membuat aturan validasi mustahil berbeda antara menambah dan
mengubah.

Member menjadi pengecualian: `username` tidak dapat diubah dan `password` menjadi
opsional saat mengubah, sehingga skemanya memang berbeda. Formnya karena itu
dipecah menjadi dua, bukan satu form dengan field yang disembunyikan, supaya
tipe dan validasinya tidak bercampur. Bagian data diri yang sama persis tetap
dipakai bersama lewat komponen generik terhadap tipe form, sehingga label dan
aturannya mustahil berbeda antara kedua form itu.

Konsekuensinya daftar field yang boleh dipasangi pesan kesalahan dari backend
juga dipisah: form ubah tidak mengirim `username` sama sekali, sehingga tidak
mungkin menerima kesalahan untuk field itu.

## 38. Password kosong pada form ubah member berarti tidak diatur ulang

`UpdateMemberAdminDto` menerima `password` sebagai field opsional yang berfungsi
sebagai reset kata sandi oleh admin. Mengirim string kosong akan ditolak karena
panjang minimumnya 6, jadi field yang dikosongkan tidak dikirim sama sekali.

Perilakunya sudah diuji langsung: mengubah data diri tanpa mengisi password
membuat member tetap dapat masuk dengan kata sandi lamanya, sedangkan mengisinya
benar-benar menggantinya.

## 39. Masa berlaku promo dikonversi ke WIB, bukan ke zona peramban

Input `datetime-local` tidak mengenal zona waktu: nilainya `YYYY-MM-DDTHH:mm`
apa adanya. Sementara itu backend menyimpan masa berlaku promo sebagai waktu
penuh ISO 8601. Tanpa penerjemahan yang disengaja, pengelola yang perambannya
tidak berzona WIB akan melihat dan mengirim jam yang berbeda dari yang ia maksud.

Karena itu `lib/waktu-lokal.ts` memaku kedua arahnya ke WIB: nilai yang diketik
selalu dibaca sebagai waktu WIB, dan nilai dari backend selalu ditampilkan dalam
WIB. Bolak-baliknya sudah diuji utuh sampai satuan menit pada zona WIB, New York,
dan UTC.

Satu akibat yang perlu diketahui: `datetime-local` tidak memiliki satuan detik,
sehingga mengubah promo yang tersimpan berakhir pada detik ke-59 akan
memangkasnya menjadi detik ke-0. Selisih kurang dari satu menit ini diterima apa
adanya karena masa berlaku promo diukur dalam hari.

## 40. Status berlaku promo dihitung di klien

`GET /admin/diskon` tidak mengirim penanda aktif (lihat `backend/docs/KEPUTUSAN.md`
nomor 28), jadi label "Berlaku", "Terjadwal", dan "Kedaluwarsa" dihitung di klien
dari rentang tanggalnya. Perhitungan ini hanya menentukan apa yang terlihat;
yang menentukan promo benar-benar dapat dipakai tetap backend saat pemesanan
dibuat.

## 41. Pencarian member dikirim ke backend, dan tidak pernah dikirim kosong

Pencarian member memakai parameter `?search` milik backend, bukan penyaringan di
klien, karena mencari di backend mencakup seluruh member dan bukan hanya yang
kebetulan sudah termuat. Ketikan ditunda dengan `useDebounced` agar tidak
mengirim satu request per huruf.

`?search=` dengan nilai kosong ditolak backend dengan 400 karena panjang
minimumnya 1. Karena itu nilai kosong diubah menjadi `undefined` sehingga
parameternya tidak ikut dikirim sama sekali, dan mengosongkan kotak pencarian
mengembalikan daftar penuh alih-alih memunculkan pesan kesalahan.

## 42. Tombol aksi reservasi mengikuti salinan mesin status

`AksiReservasi` menentukan tombol yang tampil dari `TRANSISI_STATUS`,
`bolehCheckIn`, dan `bolehCheckOut` di `lib/constants.ts`, yang disalin dari
`backend/src/admin/reservasi/status-machine.ts`. Dengan begitu pengelola tidak
pernah disodori tindakan yang pasti ditolak backend, misalnya tombol check-in
pada pemesanan yang belum disetujui.

Salinan itu hanya menentukan apa yang terlihat. Keputusan sebenarnya tetap di
backend, dan bila ternyata berbeda, pesan penolakannya ditampilkan apa adanya.
Perilaku itu sudah diuji: check-in sebelum disetujui dibalas
"Check-in hanya dapat dilakukan pada reservasi yang sudah disetujui!", dan
menyetujui pemesanan yang sudah selesai dibalas penolakan mesin status.

Seluruh aksi dikumpulkan dalam satu komponen, dipakai bersama oleh halaman
reservasi dan halaman check-in, supaya aturannya tidak perlu dijaga di dua
tempat.

## 43. Hanya pembatalan yang diberi konfirmasi

Persetujuan, check-in, dan check-out berjalan langsung tanpa dialog konfirmasi,
karena ketiganya adalah alur normal di meja depan dan masih ada jalan mundur
lewat langkah berikutnya. Pembatalan diberi konfirmasi karena statusnya bersifat
akhir: `dibatalkan` tidak memiliki perpindahan keluar sama sekali.

## 44. Perpindahan `disetujui` langsung ke `selesai` tidak disediakan

Mesin status backend mengizinkan `disetujui` langsung menjadi `selesai`, tetapi
antarmuka tidak menyediakan tombolnya. Alur yang ditawarkan adalah check-in lalu
check-out, karena keduanya sekaligus mencatat `check_in_time` dan
`check_out_time`, sedangkan melompat langsung ke `selesai` meninggalkan kedua
kolom itu kosong dan menghilangkan jejak kedatangan tamu.

Pemesanan yang tamunya tidak datang tetap punya jalan keluar lewat tombol
batalkan.

## 45. Pencarian pemesanan disaring di klien, dan keterbatasannya dinyatakan

`GET /admin/reservasi` tidak memiliki parameter pencarian kode booking maupun
nama tamu, dan mengarang parameter baru tidak diperbolehkan. Pencarian karena itu
dilakukan di klien atas data yang sudah dimuat.

Keterbatasannya nyata: yang tercakup hanya pemesanan yang sedang ditampilkan,
bukan seluruh riwayat. Agar tidak menyesatkan, keadaan kosong menyebutkannya
terang-terangan dan menyarankan melonggarkan filter, bukan sekadar berkata tidak
ditemukan.

Filter status dan space tetap dikirim ke backend karena parameternya memang
tersedia. Nilai status yang tidak dikenal pada URL diabaikan, bukan diteruskan,
supaya salah ketik tidak berujung 400.

## 46. Check-in mencocokkan agenda hari ini di klien, termasuk payload QR

Backend tidak menyediakan endpoint verifikasi QR (lihat
`backend/docs/KEPUTUSAN.md` nomor 47), jadi halaman check-in tidak mengirim
pindaian apa pun ke server. Yang dilakukannya adalah memuat agenda hari ini
sekali, lalu mencocokkan isian dengan daftar itu di klien, sehingga
pencocokannya seketika dan tetap bekerja meski jaringan lambat.

Isiannya menerima tiga bentuk: kode booking, nama tamu, dan payload QR e-ticket
`VERIFY-RESERVASI-<id>`. Bentuk ketiga membuat kamera ponsel biasa sudah cukup
untuk memakai halaman ini, tanpa memasang pustaka pemindai apa pun; pengelola
memindai QR-nya lalu menempelkan hasilnya.

Pemesanan di luar hari ini memang tidak akan ditemukan di sini, dan itu
diinginkan: check-in hanya sah untuk reservasi yang sudah disetujui, dan backend
pun dapat dipasang membatasi check-in pada tanggal sewanya lewat
`STRICT_CHECKIN_DATE`.

## 47. Laporan menampilkan angka backend apa adanya, tanpa menghitung ulang

Seluruh angka pada halaman laporan datang dari `GET /admin/reports/monthly` dan
tidak ada satu pun yang dihitung ulang di klien, termasuk baris jumlah pada
tabel rincian per tipe space. Baris itu memakai `total_transaksi`,
`total_jam_terpakai`, dan `realisasi_pendapatan_bersih` dari backend, bukan
menjumlahkan sendiri isi tabelnya.

Alasannya supaya yang tercetak persis sama dengan yang tersimpan. Bila suatu saat
keduanya berbeda, perbedaan itu akan terlihat sebagai angka yang tidak cocok dan
dapat ditelusuri, bukan tertutupi oleh penjumlahan di klien yang selalu konsisten
dengan dirinya sendiri.

Kecocokannya sudah diperiksa terhadap data nyata: untuk Agustus 2026, jumlah
`pendapatan_per_hari` (446.000) dan jumlah `rincian_per_tipe_space` (446.000)
keduanya sama dengan `realisasi_pendapatan_bersih`.

## 48. Grafik memakai recharts dan menampilkan seluruh hari, termasuk yang nol

Backend selalu mengirim seluruh hari dalam bulan itu pada `pendapatan_per_hari`,
termasuk hari yang tidak ada pemesanannya. Grafik menampilkannya apa adanya
tanpa mengisi atau membuang hari, sehingga bentuknya jujur menggambarkan hari
ramai dan hari sepi.

Label sumbu X hanya dipasang setiap lima hari agar tetap terbaca pada lebar
ponsel; tanggal lengkapnya muncul di tooltip. Bulan yang sama sekali belum
berpendapatan tidak menampilkan grafik kosong, melainkan satu kalimat yang
menyatakannya.

Warnanya memakai token `--color-chart-1` yang sudah didefinisikan sejak fase
fondasi, sehingga ikut berubah mengikuti tema terang dan gelap.

## 49. Cetak laporan memakai dialog peramban, seperti e-ticket

Tidak ada pustaka PDF yang dipasang. Tombol cetak memanggil `window.print()`,
dan pengguna dapat memilih "Simpan sebagai PDF" dari dialog peramban. Tata letak
kertasnya diatur `@media print` di `globals.css` lewat kelas `cetak-laporan`,
yang memang sudah disiapkan sejak fase fondasi bersama `cetak-tiket`.

Kop laporan berisi nama lokasi dan waktu cetak hanya muncul di atas kertas
(`hidden print:block`), karena di layar konteks itu sudah jelas dari judul
halaman dan sidebar. Pemilih bulan dan tombol cetaknya sendiri disembunyikan saat
mencetak.

## 50. Perbaikan: `MonthPicker` menampilkan nomor bulan sebelum hidrasi

`SelectValue` milik base-ui mencari label dari daftar item, sedangkan daftar itu
belum terdaftar saat render di server. Akibatnya muatan pertama menampilkan "8",
lalu berubah menjadi "Agustus" setelah hidrasi.

Perbaikannya memberi `SelectValue` fungsi render sendiri sehingga labelnya
dihitung langsung dari prop `month`. Masalah ini sudah ada sejak halaman histori
member dibuat dan baru terlihat ketika komponennya dipakai pada halaman laporan;
perbaikannya di satu tempat menyembuhkan keduanya.
