import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Bingkai daftar ringkas pada dashboard: judul, tautan lihat semua, lalu isinya.
 * Dipakai bersama oleh agenda hari ini dan antrean konfirmasi agar keduanya
 * tampil seragam.
 */
export function PanelDaftar({
  judul,
  keterangan,
  href,
  labelTautan = 'Lihat semua',
  children,
}: {
  judul: string;
  keterangan?: string;
  href: string;
  labelTautan?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-card grid gap-1 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3 px-1 pb-2">
        <div className="grid gap-0.5">
          <h2 className="font-semibold">{judul}</h2>
          {keterangan ? (
            <p className="text-muted-foreground text-xs">{keterangan}</p>
          ) : null}
        </div>

        <Link
          href={href}
          className="text-primary inline-flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
        >
          {labelTautan}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {children}
    </section>
  );
}
