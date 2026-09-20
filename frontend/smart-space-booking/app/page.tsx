import { ArrowUpRight, Building2, Clock3, Globe } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Merek } from '@/components/layout/merek';
import { PilihTema } from '@/components/layout/pilih-tema';
import { Rupiah } from '@/components/shared/rupiah';
import { SpaceImage } from '@/components/shared/space-image';
import { daftarSpace } from '@/lib/api/spaces';
import { ApiError } from '@/lib/api/error';
import { sesiServer } from '@/lib/auth/server';
import { BERANDA_ROLE, LABEL_TIPE, URUTAN_TIPE } from '@/lib/constants';
import { rupiah, tanggalPendek, hariIniWib } from '@/lib/format';
import type { SpacePublik } from '@/types/entities';

export const dynamic = 'force-dynamic';

/** Sebanyak ini yang dipamerkan; selebihnya lewat tautan ke katalog. */
const MAKS_SOROT = 4;

/**
 * Halaman muka bergaya editorial.
 *
 * Tata letaknya meniru halaman majalah: satu judul raksasa yang memikul seluruh
 * perhatian, satu bidang berwarna sebagai jangkar visual, dan angka-angka besar
 * sebagai bukti. Warnanya hemat — krem, tinta, dan satu kuning — sehingga
 * hierarkinya dibangun oleh ukuran, bukan oleh banyak warna.
 *
 * Seluruh angka dan gambar yang tampil berasal dari katalog yang sama dengan
 * yang dilihat pengunjung, bukan dari data yang ditulis tangan. Bila backend
 * sedang tidak dapat dihubungi, bagian itu dilewati dan halamannya tetap tampil.
 */
export default async function Beranda() {
  const { role } = await sesiServer();

  if (role) {
    redirect(BERANDA_ROLE[role]);
  }

  let semua: SpacePublik[] = [];

  try {
    semua = await daftarSpace();
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }
  }

  const sorot = semua.slice(0, MAKS_SOROT);
  const utama = sorot[0];
  const termurah = semua.length
    ? Math.min(...semua.map((s) => s.harga_per_jam))
    : null;
  const lokasi = new Set(semua.map((s) => s.owner.nama_coworking));

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-6 px-5 py-6">
        <Merek />

        <nav aria-label="Navigasi utama" className="ml-6 hidden md:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            <li>
              <Link href="/spaces" className="hover:text-primary transition-colors">
                Ruangan
              </Link>
            </li>
            <li>
              <Link href="#cara" className="hover:text-primary transition-colors">
                Cara kerja
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-primary transition-colors">
                Pengelola
              </Link>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Pil kecil berisi konteks hari ini, seperti penanda tanggal pada
              halaman majalah. Disembunyikan di layar sempit agar tidak berebut
              ruang dengan tombol masuk. */}
          <span className="border-foreground/15 hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex">
            <span className="bg-primary size-1.5 rounded-full" />
            {lokasi.size} lokasi · {tanggalPendek(hariIniWib())}
          </span>

          <PilihTema />

          <Link
            href="/login"
            className="hover:text-primary px-2 text-sm font-semibold transition-colors"
          >
            Masuk
          </Link>

          <Link
            href="/register"
            className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          >
            Daftar
          </Link>
        </div>
      </header>

      <main
        id="konten-utama"
        className="mx-auto w-full max-w-6xl flex-1 overflow-x-clip px-5 pb-24"
      >
        {/* ---------- bagian utama ---------- */}
        <section className="masuk grid items-start gap-8 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-10">
          <div className="grid gap-7">
            <h1 className="text-[3.4rem] leading-[0.88] font-extrabold tracking-[-0.045em] sm:text-[4.6rem] lg:text-[5.4rem]">
              ruang kerja
              <br />
              <span className="text-primary">per jam.</span>
            </h1>

            <p className="text-muted-foreground max-w-md text-[0.95rem] leading-relaxed text-pretty">
              Pesan meja kerja atau ruang rapat tanpa kontrak bulanan. Jadwalnya
              dihitung dari pemesanan yang sudah ada, harganya tampil sebelum
              kamu menekan tombol, dan tiketnya berupa QR yang tinggal dipindai
              saat datang.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/spaces"
                className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-colors"
              >
                Jelajahi Ruangan
                <ArrowUpRight className="size-4" />
              </Link>

              <Link
                href="/register"
                className="border-foreground/20 hover:border-foreground inline-flex items-center rounded-full border px-6 py-3.5 text-sm font-bold transition-colors"
              >
                Buat akun
              </Link>
            </div>

            {/* Angka besar sebagai bukti, bukan hiasan: seluruhnya dihitung dari
                katalog yang sedang berjalan. */}
            <dl className="border-foreground/15 grid grid-cols-3 gap-4 border-t pt-6">
              <Angka
                nilai={`${semua.length}`}
                label="Ruangan siap dipesan hari ini"
              />
              <Angka
                nilai={`${lokasi.size}`}
                label="Lokasi coworking yang terhubung"
              />
              <Angka
                nilai={termurah !== null ? rupiah(termurah).replace('Rp ', '') : '—'}
                label="Tarif termurah per jam"
                kecil
              />
            </dl>
          </div>

          {/* ---------- bidang kuning ---------- */}
          <div className="relative">
            <div className="bg-primary relative overflow-hidden rounded-[2rem] p-3">
              {utama ? (
                <SpaceImage
                  url={utama.foto_url}
                  nama={utama.nama_space}
                  className="aspect-[4/5] w-full rounded-[1.5rem] object-cover sm:aspect-[5/5]"
                />
              ) : (
                <div className="bg-primary-foreground/10 aspect-[4/5] w-full rounded-[1.5rem]" />
              )}

              <span className="bg-foreground text-background absolute top-6 right-6 grid size-12 place-items-center rounded-full">
                <Globe className="size-5" />
              </span>

              {/* Tirai gelap di kaki gambar. Tanpa ini, keterangan di atasnya
                  hilang ketika fotonya kebetulan terang di bagian bawah. */}
              {utama ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-3 bottom-3 h-40 rounded-b-[1.5rem] bg-gradient-to-t from-black/75 via-black/35 to-transparent"
                />
              ) : null}

              {utama ? (
                <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between gap-3 text-white">
                  <div className="min-w-0">
                    <p className="text-[0.7rem] font-bold tracking-[0.14em] uppercase opacity-80">
                      Sedang tersedia
                    </p>
                    <p className="truncate text-lg font-bold">
                      {utama.nama_space}
                    </p>
                  </div>

                  <Link
                    href={`/spaces/${utama.id}`}
                    aria-label={`Lihat ${utama.nama_space}`}
                    className="bg-primary text-primary-foreground hover:bg-white hover:text-black grid size-11 shrink-0 place-items-center rounded-full transition-colors"
                  >
                    <ArrowUpRight className="size-5" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* ---------- pita berjalan ---------- */}
        <section
          aria-hidden
          className="border-foreground/15 mt-14 overflow-hidden border-y py-4"
        >
          <div className="pita flex w-max gap-8 text-[1.6rem] font-extrabold tracking-tight whitespace-nowrap sm:text-[2rem]">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="flex items-center gap-8">
                <span>sewa per jam</span>
                <span className="text-primary">&bull;</span>
                <span>e-ticket QR</span>
                <span className="text-primary">&bull;</span>
                <span>tanpa kontrak</span>
                <span className="text-primary">&bull;</span>
              </span>
            ))}
          </div>
        </section>

        {/* ---------- cara kerja ---------- */}
        <section id="cara" className="scroll-mt-20 pt-16">
          <h2 className="text-[2rem] leading-[0.95] font-extrabold tracking-[-0.03em] sm:text-[2.6rem]">
            tiga langkah,
            <br />
            <span className="text-muted-foreground">selesai.</span>
          </h2>

          <ol className="masuk-berurut mt-8 grid gap-4 sm:grid-cols-3">
            <Langkah
              nomor="01"
              judul="Pilih jadwalnya"
              keterangan="Tentukan tanggal, jam mulai, dan durasinya. Jam yang sudah dipesan orang lain tidak ditawarkan."
            />
            <Langkah
              nomor="02"
              judul="Pakai kode promo"
              keterangan="Kode diperiksa sebelum memesan, dan potongannya langsung terlihat pada rincian harga."
            />
            <Langkah
              nomor="03"
              judul="Tunjukkan QR-nya"
              keterangan="E-ticket dapat dicetak atau ditunjukkan dari layar, lalu dipindai pengelola saat kamu datang."
            />
          </ol>
        </section>

        {/* ---------- sorotan ruangan ---------- */}
        {sorot.length > 0 ? (
          <section className="pt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[2rem] leading-[0.95] font-extrabold tracking-[-0.03em] sm:text-[2.6rem]">
                pilih ruangmu
              </h2>

              <Link
                href="/spaces"
                className="border-foreground/20 hover:border-foreground inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors"
              >
                Lihat semua
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <ul className="masuk-berurut mt-8 grid gap-5 sm:grid-cols-2">
              {sorot.map((space, i) => (
                <li key={space.id}>
                  <Link
                    href={`/spaces/${space.id}`}
                    className="group focus-visible:ring-ring block focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div className="bg-muted relative overflow-hidden rounded-[1.5rem]">
                      <SpaceImage
                        url={space.foto_url}
                        nama={space.nama_space}
                        className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
                          i % 3 === 0 ? 'aspect-[4/3]' : 'aspect-[16/11]'
                        }`}
                      />

                      <span className="bg-background/90 absolute top-4 left-4 rounded-full px-3 py-1.5 text-[0.7rem] font-bold tracking-wide uppercase backdrop-blur-sm">
                        {LABEL_TIPE[space.tipe]}
                      </span>

                      <span className="bg-foreground text-background absolute right-4 bottom-4 grid size-10 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="group-hover:text-primary truncate text-lg font-bold tracking-tight transition-colors">
                          {space.nama_space}
                        </p>
                        <p className="text-muted-foreground mt-1 flex items-center gap-1.5 truncate text-sm">
                          <Building2 className="size-3.5 shrink-0" />
                          {space.owner.nama_coworking}
                        </p>
                      </div>

                      <p className="shrink-0 text-right">
                        <Rupiah
                          nilai={space.harga_per_jam}
                          className="text-lg font-extrabold tracking-tight"
                        />
                        <span className="text-muted-foreground block text-xs">
                          per jam
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- tipe ruang ---------- */}
        <section className="pt-16">
          <h2 className="text-muted-foreground text-xs font-bold tracking-[0.16em] uppercase">
            Telusuri per tipe
          </h2>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {URUTAN_TIPE.map((tipe) => (
              <Link
                key={tipe}
                href={`/spaces?tipe=${tipe}`}
                className="border-foreground/20 hover:bg-foreground hover:text-background inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors"
              >
                {LABEL_TIPE[tipe]}
                <ArrowUpRight className="size-3.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- ajakan penutup ---------- */}
        <section className="bg-foreground text-background mt-16 overflow-hidden rounded-[2rem] px-7 py-12 sm:px-12 sm:py-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <p className="text-primary flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase">
                <Clock3 className="size-3.5" />
                Mulai hari ini
              </p>

              <h2 className="mt-4 text-[2.2rem] leading-[0.94] font-extrabold tracking-[-0.035em] sm:text-[3rem]">
                buat akun,
                <br />
                <span className="text-primary">langsung pesan.</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/register"
                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
              >
                Buat akun
                <ArrowUpRight className="size-4" />
              </Link>

              <Link
                href="/admin/login"
                className="border-background/25 hover:bg-background hover:text-foreground inline-flex items-center rounded-full border px-6 py-3.5 text-sm font-bold transition-colors"
              >
                Masuk ke panel pengelola
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-foreground/15 mx-auto w-full max-w-6xl border-t px-5 py-7">
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-xs">
          <span>Smart Space Booking — UKK RPL 2026/2027</span>
          <span>Foto ruangan: Unsplash</span>
        </div>
      </footer>
    </div>
  );
}

/** Satu angka besar pada bagian bukti. */
function Angka({
  nilai,
  label,
  kecil,
}: {
  nilai: string;
  label: string;
  kecil?: boolean;
}) {
  return (
    <div>
      <dt
        className={`font-extrabold tracking-[-0.04em] ${
          kecil ? 'text-[1.6rem] sm:text-[1.9rem]' : 'text-[2.1rem] sm:text-[2.6rem]'
        }`}
      >
        {nilai}
      </dt>
      <dd className="text-muted-foreground mt-1 text-[0.72rem] leading-snug">
        {label}
      </dd>
    </div>
  );
}

/** Satu langkah pada bagian cara kerja. */
function Langkah({
  nomor,
  judul,
  keterangan,
}: {
  nomor: string;
  judul: string;
  keterangan: string;
}) {
  return (
    <li className="border-foreground/15 hover:border-primary grid gap-3 rounded-[1.25rem] border p-6 transition-colors">
      <span className="text-primary text-[2rem] leading-none font-extrabold tracking-[-0.04em]">
        {nomor}
      </span>
      <p className="text-lg font-bold tracking-tight">{judul}</p>
      <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
        {keterangan}
      </p>
    </li>
  );
}
