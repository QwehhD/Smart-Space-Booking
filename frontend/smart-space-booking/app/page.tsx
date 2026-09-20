import {
  ArrowRight,
  BadgePercent,
  CalendarCheck,
  CheckCircle2,
  Compass,
  QrCode,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
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

const MAKS_SOROT = 3;

/**
 * Halaman muka utama untuk pengunjung:
 * Dirancang elegan, modern, dan kaya animasi dengan efek visual berkelas.
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
    if (!(error instanceof ApiError)) {
      throw error;
    }
  }

  const termurah = sorot.length
    ? Math.min(...sorot.map((s) => s.harga_per_jam))
    : null;

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden">
      {/* Latar Belakang Aurora Ambient Mengambang */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full bg-gradient-to-tr from-primary/20 via-sky-500/15 to-violet-500/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[28%] -left-20 w-[420px] h-[360px] rounded-full bg-gradient-to-br from-primary/15 to-emerald-500/10 blur-[100px] animate-float-slow" />
        <div className="absolute top-[48%] -right-20 w-[460px] h-[380px] rounded-full bg-gradient-to-bl from-violet-500/15 to-primary/10 blur-[110px] animate-float-reverse" />
      </div>

      {/* Navigasi Atas Glassmorphic */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Merek />

          <div className="flex items-center gap-2">
            <PilihTema />
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/login">Masuk</Link>}
            />
            <Button
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/register">Daftar Sekarang</Link>}
            />
          </div>
        </div>
      </header>

      <main
        id="konten-utama"
        className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 pb-24"
      >
        {/* HERO SECTION */}
        <section className="masuk relative grid gap-8 pt-12 pb-16 text-center sm:pt-20 sm:pb-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
            {/* Pill Status Animasi */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Inovasi Coworking Space & Ruang Kerja Pintar
              </span>
            </div>

            {/* Judul Utama dengan Gradasi Elegan */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance leading-[1.12]">
              Sewa Ruang Kerja Modern,{' '}
              <span className="text-gradient-primary">Pesan Instan Per Jam</span>
            </h1>

            {/* Deskripsi */}
            <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed text-pretty">
              Akses meja kerja fleksibel dan ruang rapat eksekutif tanpa kontrak ribet.
              Cek jadwal real-time, klaim promo spesial, dan tunjukkan e-ticket QR langsung saat tiba.
              {termurah !== null ? (
                <span className="block mt-2 font-medium text-foreground">
                  Mulai dari{' '}
                  <span className="text-primary font-bold">
                    <Rupiah nilai={termurah} />
                  </span>{' '}
                  per jam.
                </span>
              ) : null}
            </p>

            {/* Tombol Aksi Utama */}
            <div className="mt-2 flex flex-wrap justify-center items-center gap-3.5">
              <Button
                size="lg"
                className="h-12 px-7 text-sm font-semibold shadow-lg shadow-primary/25"
                render={
                  <Link href="/spaces" className="flex items-center gap-2">
                    <Compass className="size-4" />
                    Jelajahi Ruangan
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-sm font-semibold"
                render={<Link href="/register">Buat Akun Member</Link>}
              />
            </div>

            {/* Kepercayaan & Portal Admin */}
            <div className="mt-3 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Jadwal 100% Real-time
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                E-Ticket QR Otomatis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                Tanpa Biaya Tersembunyi
              </span>
            </div>

            <p className="text-muted-foreground text-xs pt-2">
              Pengelola coworking space?{' '}
              <Link
                href="/admin/login"
                className="text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                Masuk ke panel pengelola &rarr;
              </Link>
            </p>
          </div>

          {/* VISUAL MOCKUP PREVIEW DENGAN FLOATING BADGES */}
          <div className="relative mx-auto mt-4 w-full max-w-4xl">
            <div className="relative rounded-2xl border border-border/80 bg-card/60 p-3 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                <div className="relative aspect-[16/8] sm:aspect-[16/7] w-full bg-gradient-to-br from-primary/10 via-background to-accent/20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="size-14 rounded-2xl bg-primary/15 text-primary grid place-items-center shadow-inner">
                      <Zap className="size-7" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-bold text-primary tracking-wide uppercase">
                        Sistem Reservasi Generasi Baru
                      </p>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Cepat • Transparan • Terotomasi
                      </h2>
                      <p className="text-muted-foreground text-xs sm:text-sm max-w-md">
                        Pilih slot jam yang kamu mau, dapatkan tiket QR resmi, dan nikmati fasilitas kerja berkelas dunia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge Kiri */}
              <div className="absolute -top-4 -left-2 sm:-left-6 hidden sm:flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/90 px-4 py-2.5 shadow-lg backdrop-blur-md animate-float-slow">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <QrCode className="size-4" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold leading-none">Instant E-Ticket</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Langsung Scan QR di Lokasi</p>
                </div>
              </div>

              {/* Floating Badge Kanan */}
              <div className="absolute -bottom-4 -right-2 sm:-right-6 hidden sm:flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/90 px-4 py-2.5 shadow-lg backdrop-blur-md animate-float-reverse">
                <span className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-500">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold leading-none">4.9 / 5.0 Rating</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Kepuasan Ribuan Profesional</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS COUNTER / STATISTIK CEPAT */}
        <section className="masuk-berurut grid grid-cols-2 gap-3 sm:grid-cols-4 py-6">
          <StatBox nilai="100%" label="Jadwal Akurat" sub="Real-time tanpa bentrok" />
          <StatBox nilai="0 Detik" label="Penerbitan Tiket" sub="E-ticket ber-QR langsung jadi" />
          <StatBox nilai="Diskon" label="Promo Fleksibel" sub="Potongan harga transparan" />
          <StatBox nilai="24/7" label="Dukungan Akses" sub="Sistem siap kapan saja" />
        </section>

        {/* FITUR UNGGULAN KARTU GLASS INTERAKTIF */}
        <section className="grid gap-6 pt-16">
          <div className="text-center max-w-xl mx-auto grid gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Fitur Cerdas
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Didesain Khusus untuk Kenyamanan Kerjamu
            </h2>
          </div>

          <div className="masuk-berurut grid gap-4 sm:grid-cols-3 pt-4">
            <FiturKartu
              icon={<CalendarCheck className="size-5" />}
              judul="Jadwal Apa Adanya"
              keterangan="Ketersediaan dihitung langsung dari pemesanan yang ada. Jam yang kamu pilih dijamin bebas bentrok."
              warna="primary"
            />
            <FiturKartu
              icon={<BadgePercent className="size-5" />}
              judul="Potongan Transparan"
              keterangan="Masukkan kode voucher diskon dan lihat penghematan tarif langsung terhitung sebelum konfirmasi pesanan."
              warna="emerald"
            />
            <FiturKartu
              icon={<QrCode className="size-5" />}
              judul="E-Ticket QR Digital"
              keterangan="Tiket digital siap simpan, cetak, atau ditunjukkan di ponsel. Pengelola cukup scan untuk check-in instan."
              warna="violet"
            />
          </div>
        </section>

        {/* 3 LANGKAH MUDAH */}
        <section className="grid gap-6 pt-20">
          <div className="text-center max-w-xl mx-auto grid gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Alur Reservasi
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              3 Langkah Praktis Mulai Bekerja
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-4">
            <LangkahBox
              nomor="01"
              judul="Pilih Ruangan"
              keterangan="Telusuri pilihan personal desk, private office, atau ruang meeting sesuai kebutuhan timmu."
            />
            <LangkahBox
              nomor="02"
              judul="Tentukan Waktu"
              keterangan="Pilih tanggal dan jam sewa. Sistem memeriksa ketersediaan seketika dan menghitung total harga."
            />
            <LangkahBox
              nomor="03"
              judul="Check-in dengan QR"
              keterangan="Dapatkan e-ticket resmi dengan kode booking dan QR code untuk validasi cepat saat tiba."
            />
          </div>
        </section>

        {/* SPOTLIGHT RUANG YANG TERSEDIA */}
        {sorot.length > 0 ? (
          <section className="grid gap-6 pt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Katalog Unggulan
                  </p>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Ruang Kerja Sedang Tersedia
                </h2>
                <p className="text-muted-foreground text-sm">
                  Pilihan terbaik yang siap dipesan untuk sesi kerjamu hari ini.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="font-medium"
                render={
                  <Link href="/spaces" className="flex items-center gap-1.5">
                    Lihat Semua Ruangan
                    <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
            </div>

            <ul className="masuk-berurut grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sorot.map((space) => (
                <li key={space.id}>
                  <Link
                    href={`/spaces/${space.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <div className="relative overflow-hidden">
                      <SpaceImage
                        url={space.foto_url}
                        nama={space.nama_space}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <TipeBadge tipe={space.tipe} className="shadow-md backdrop-blur-md" />
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/80 to-transparent" />
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="grid gap-1">
                        <h3 className="text-base font-bold leading-snug group-hover:text-primary transition-colors">
                          {space.nama_space}
                        </h3>
                        <p className="text-muted-foreground text-xs truncate">
                          {space.owner.nama_coworking}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Tarif Sewa</p>
                          <p className="font-bold text-foreground">
                            <Rupiah nilai={space.harga_per_jam} />
                            <span className="text-xs text-muted-foreground font-normal"> / jam</span>
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                          Pesan
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* TIPE RUANG FILTER CEPAT */}
        <section className="grid gap-4 pt-16">
          <h2 className="text-xl font-bold tracking-tight">
            Cari Berdasarkan Kategori
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {URUTAN_TIPE.map((tipe) => (
              <Link
                key={tipe}
                href={`/spaces?tipe=${tipe}`}
                className="group flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm font-semibold shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span>{LABEL_TIPE[tipe]}</span>
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION BANNER MEWAH */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-background p-8 sm:p-12 text-center shadow-xl relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,var(--tw-gradient-from),transparent)] from-primary/25"
          />

          <div className="mx-auto max-w-2xl grid gap-4">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Sparkles className="size-6" />
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Siap Meningkatkan Produktivitasmu?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base text-pretty">
              Temukan suasana kerja tenang, fasilitas internet berkecepatan tinggi, dan ruang rapat representatif hari ini.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="h-11 px-6 font-semibold shadow-md shadow-primary/20"
                render={<Link href="/spaces">Lihat Semua Ruangan</Link>}
              />
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 font-semibold"
                render={<Link href="/register">Daftar Akun Baru</Link>}
              />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-muted/20 py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <Merek />
          <p className="text-center sm:text-right">
            Smart Space Booking — Uji Kompetensi Keahlian RPL 2026/2027
          </p>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistem Operasional Normal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatBox({
  nilai,
  label,
  sub,
}: {
  nilai: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-primary/30">
      <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-primary">
        {nilai}
      </p>
      <p className="mt-1 text-xs sm:text-sm font-bold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function FiturKartu({
  icon,
  judul,
  keterangan,
  warna,
}: {
  icon: React.ReactNode;
  judul: string;
  keterangan: string;
  warna: 'primary' | 'emerald' | 'violet';
}) {
  const warnaGaya = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  }[warna];

  return (
    <div className="group rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      <span
        className={`grid size-11 place-items-center rounded-xl border shadow-2xs transition-transform duration-300 group-hover:scale-110 ${warnaGaya}`}
      >
        {icon}
      </span>
      <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
        {judul}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed text-pretty">
        {keterangan}
      </p>
    </div>
  );
}

function LangkahBox({
  nomor,
  judul,
  keterangan,
}: {
  nomor: string;
  judul: string;
  keterangan: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border/70 bg-card/70 p-6 shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-primary/30">
      <span className="font-mono text-xs font-bold text-primary tracking-wider">
        {nomor}
      </span>
      <h3 className="mt-2 text-base font-bold tracking-tight text-foreground">
        {judul}
      </h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed text-pretty">
        {keterangan}
      </p>
    </div>
  );
}
