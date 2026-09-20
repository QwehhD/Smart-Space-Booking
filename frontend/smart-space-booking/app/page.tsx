import { ArrowRight, BadgePercent, CalendarCheck, QrCode } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Merek } from '@/components/layout/merek';
import { PilihTema } from '@/components/layout/pilih-tema';
import { Rupiah } from '@/components/shared/rupiah';
import { SpaceImage } from '@/components/shared/space-image';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { Button } from '@/components/ui/button';
import { daftarSpace } from '@/lib/api/spaces';
import { ApiError } from '@/lib/api/error';
import { sesiServer } from '@/lib/auth/server';
import { BERANDA_ROLE, LABEL_TIPE, URUTAN_TIPE } from '@/lib/constants';
import type { SpacePublik } from '@/types/entities';

export const dynamic = 'force-dynamic';

/** Sebanyak ini saja yang dipamerkan; selebihnya lewat tombol ke katalog. */
const MAKS_SOROT = 3;

/**
 * Halaman muka untuk pengunjung yang belum masuk.
 *
 * Pengguna yang sudah punya sesi tidak perlu melihat halaman ini sama sekali
 * dan langsung diantar ke beranda miliknya — itulah rencana yang dicatat pada
 * halaman sementara sebelumnya, dan kini dijalankan.
 *
 * Space yang dipamerkan diambil dari katalog yang sama dengan yang dilihat
 * pengunjung, bukan dari daftar yang ditulis tangan, supaya halaman ini selalu
 * menampilkan isi yang benar-benar ada. Bila backend sedang tidak dapat
 * dihubungi, bagian itu dilewati dan sisa halamannya tetap tampil.
 */
export default async function Beranda() {
  const { role } = await sesiServer();

  if (role) {
    redirect(BERANDA_ROLE[role]);
  }

  let sorot: SpacePublik[] = [];

  try {
    sorot = (await daftarSpace()).slice(0, MAKS_SOROT);
  } catch (error) {
    // Halaman muka tidak boleh gagal hanya karena katalognya belum siap.
    if (!(error instanceof ApiError)) {
      throw error;
    }
  }

  const termurah = sorot.length
    ? Math.min(...sorot.map((s) => s.harga_per_jam))
    : null;

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden
        className="from-accent/70 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_-10%,var(--tw-gradient-from),transparent_70%)]"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Merek />

        <div className="flex items-center gap-1.5">
          <PilihTema />
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/login">Masuk</Link>}
          />
          <Button size="sm" render={<Link href="/register">Daftar</Link>} />
        </div>
      </header>

      <main
        id="konten-utama"
        className="mx-auto w-full max-w-5xl flex-1 overflow-x-clip px-4 pb-20"
      >
        <section className="masuk grid gap-6 py-12 text-center sm:py-16">
          <div className="grid gap-4">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Coworking space, sewa per jam
            </p>

            <h1 className="mx-auto max-w-2xl text-[2.1rem] leading-[1.12] font-semibold tracking-tight text-balance sm:text-[2.75rem]">
              Cari meja kerja atau ruang rapat, pesan langsung per jam
            </h1>

            <p className="text-muted-foreground mx-auto max-w-xl text-pretty">
              Lihat jadwal yang benar-benar kosong, pakai kode promo bila ada,
              lalu tunjukkan e-ticket ber-QR saat datang.
              {termurah !== null ? (
                <>
                  {' '}
                  Mulai dari <Rupiah nilai={termurah} className="text-foreground font-semibold" />{' '}
                  per jam.
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" render={<Link href="/spaces">
              Lihat ketersediaan
              <ArrowRight />
            </Link>} />
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/register">Buat akun</Link>}
            />
          </div>

          <p className="text-muted-foreground text-xs">
            Pengelola coworking space?{' '}
            <Link
              href="/admin/login"
              className="text-primary font-medium hover:underline"
            >
              Masuk ke panel pengelola
            </Link>
          </p>
        </section>

        <section className="masuk-berurut grid gap-3 sm:grid-cols-3">
          <Fitur
            icon={<CalendarCheck className="size-4" />}
            judul="Jadwal apa adanya"
            keterangan="Ketersediaan dihitung dari pemesanan yang sudah ada, jadi jam yang ditawarkan memang masih kosong."
          />
          <Fitur
            icon={<BadgePercent className="size-4" />}
            judul="Potongan langsung terlihat"
            keterangan="Kode promo diperiksa sebelum memesan, dan harga akhirnya tampil sebelum kamu menekan tombol."
          />
          <Fitur
            icon={<QrCode className="size-4" />}
            judul="E-ticket ber-QR"
            keterangan="Tiket dapat dicetak atau ditunjukkan dari layar, lalu dipindai pengelola saat check-in."
          />
        </section>

        {sorot.length > 0 ? (
          <section className="grid gap-4 pt-14">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  Sedang tersedia
                </h2>
                <p className="text-muted-foreground text-sm">
                  Sebagian ruangan dan meja yang bisa dipesan sekarang.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                render={<Link href="/spaces">
                  Lihat semua
                  <ArrowRight />
                </Link>}
              />
            </div>

            <ul className="masuk-berurut grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorot.map((space) => (
                <li key={space.id}>
                  <Link
                    href={`/spaces/${space.id}`}
                    className="group bg-card shadow-xs hover:shadow-md hover:border-primary/25 focus-visible:ring-ring block overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <SpaceImage
                      url={space.foto_url}
                      nama={space.nama_space}
                      className="aspect-[16/10] w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />

                    <div className="grid gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="leading-snug font-medium">
                          {space.nama_space}
                        </p>
                        <TipeBadge tipe={space.tipe} className="shrink-0" />
                      </div>

                      <p className="text-muted-foreground truncate text-sm">
                        {space.owner.nama_coworking}
                      </p>

                      <p className="border-t pt-2 text-sm">
                        <Rupiah
                          nilai={space.harga_per_jam}
                          className="text-base font-semibold"
                        />
                        <span className="text-muted-foreground text-xs"> / jam</span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="grid gap-3 pt-14">
          <h2 className="text-xl font-semibold tracking-tight">
            Tipe ruang yang tersedia
          </h2>

          <div className="flex flex-wrap gap-2">
            {URUTAN_TIPE.map((tipe) => (
              <Link
                key={tipe}
                href={`/spaces?tipe=${tipe}`}
                className="bg-card shadow-xs hover:border-primary/30 hover:text-primary focus-visible:ring-ring rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {LABEL_TIPE[tipe]}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground mx-auto w-full max-w-5xl border-t px-4 py-6 text-xs">
        Smart Space Booking — Uji Kompetensi Keahlian RPL 2026/2027
      </footer>
    </div>
  );
}

function Fitur({
  icon,
  judul,
  keterangan,
}: {
  icon: React.ReactNode;
  judul: string;
  keterangan: string;
}) {
  return (
    <div className="bg-card shadow-xs grid gap-2 rounded-xl border p-5">
      <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-lg">
        {icon}
      </span>
      <p className="font-medium">{judul}</p>
      <p className="text-muted-foreground text-sm text-pretty">{keterangan}</p>
    </div>
  );
}
