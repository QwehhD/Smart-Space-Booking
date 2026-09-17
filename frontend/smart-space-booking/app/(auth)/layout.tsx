import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Bingkai halaman masuk dan daftar.
 *
 * Dibuat satu kolom yang terpusat dan tidak terlalu lebar, karena form di sini
 * hanya berisi sedikit field dan lebih mudah dibaca bila barisnya pendek.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="px-4 py-5">
        <Link
          href="/"
          className="text-primary font-mono text-xs tracking-widest uppercase"
        >
          Smart Space Booking
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
