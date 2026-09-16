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

Variabel `NEXT_PUBLIC_MAKER_KEY` juga diganti namanya menjadi
`NEXT_PUBLIC_APP_KEY` mengikuti dokumen rencana.

## 3. Tipe entitas diturunkan dari serializer backend, bukan dari Swagger

`backend/docs/swagger.json` tidak memuat skema response sama sekali: nol dari 50
endpoint mendokumentasikan bentuk balasannya, karena tidak ada satu pun endpoint
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
