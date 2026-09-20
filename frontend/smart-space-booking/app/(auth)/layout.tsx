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
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden
        className="from-accent/60 pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_0%,var(--tw-gradient-from),transparent_70%)]"
      />

      <header className="flex items-center justify-between px-5 py-5">
        <Link
          href="/"
          aria-label="Smart Space Booking, ke beranda"
          className="focus-visible:ring-ring inline-flex rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <Merek />
        </Link>
        <PilihTema />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pt-2 pb-16">
        <div className="w-full max-w-sm">
          <div className="bg-card shadow-md rounded-2xl border p-6 sm:p-7">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
