import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Merek } from '@/components/layout/merek';
import { PilihTema } from '@/components/layout/pilih-tema';

/**
 * Bingkai halaman masuk dan daftar.
 *
 * Satu kolom terpusat dan tidak terlalu lebar, karena form di sini hanya berisi
 * sedikit field dan lebih mudah dibaca bila barisnya pendek. Isinya diletakkan
 * di atas permukaan kartu yang terangkat supaya terbaca sebagai satu tugas yang
 * berdiri sendiri, bukan sebagai potongan halaman yang mengambang.
 *
 * Latar diberi gradasi radial yang sangat tipis dari warna aksen. Tujuannya
 * sekadar memberi arah pandang ke tengah layar; pada layar yang tidak akurat pun
 * ia hanya terbaca sebagai putih.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden">
      {/* Ambient Aurora Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-primary/20 via-sky-500/10 to-violet-500/10 blur-[100px] animate-pulse-glow" />
        <div className="absolute top-[40%] -right-20 w-[400px] h-[350px] rounded-full bg-gradient-to-bl from-primary/15 to-emerald-500/10 blur-[90px] animate-float-slow" />
      </div>

      <header className="flex items-center justify-between px-6 py-5">
        <Link
          href="/"
          aria-label="Smart Space Booking, ke beranda"
          className="focus-visible:ring-ring inline-flex rounded-xl focus-visible:ring-2 focus-visible:outline-none transition-transform hover:scale-105"
        >
          <Merek />
        </Link>
        <div className="flex items-center gap-2">
          {/* Jalan pulang yang jelas. Lambang di sebelah kiri memang menaut ke
              beranda, tetapi tautan pada logo bukan sesuatu yang semua orang
              menduga, jadi disediakan tombol tersendiri. Teksnya disembunyikan
              di layar sempit, sementara namanya tetap terbaca pembaca layar
              lewat aria-label. */}
          <Link
            href="/"
            aria-label="Kembali ke beranda"
            className="border-border/80 hover:border-foreground/40 hover:bg-accent focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-4"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">Beranda</span>
          </Link>

          <PilihTema />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pt-2 pb-16 masuk">
        <div className="w-full max-w-md">
          <div className="relative rounded-3xl border border-border/80 bg-card/85 p-7 sm:p-9 shadow-2xl backdrop-blur-xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
