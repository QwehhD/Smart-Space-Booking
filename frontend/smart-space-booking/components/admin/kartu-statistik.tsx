import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Satu angka ringkas pada dashboard.
 *
 * Ikonnya diterima sebagai elemen, bukan sebagai komponen, karena dashboard
 * dirender di server sedangkan ikon lucide adalah fungsi; fungsi tidak dapat
 * dilewatkan sebagai prop dari Server Component ke Client Component, dan bentuk
 * elemen membuat kartu ini aman dipakai di kedua sisi.
 */
export function KartuStatistik({
  label,
  nilai,
  keterangan,
  icon,
  className,
}: {
  label: string;
  nilai: ReactNode;
  keterangan?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-card shadow-xs grid gap-2 rounded-xl border p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-[0.8rem] font-medium">
          {label}
        </span>
        {/* Ikon diberi bidang sendiri supaya terbaca sebagai penanda, bukan
            sebagai bagian dari teks label di sebelahnya. */}
        {icon ? (
          <span className="bg-accent text-accent-foreground grid size-7 shrink-0 place-items-center rounded-lg">
            {icon}
          </span>
        ) : null}
      </div>

      <p className="text-[1.6rem] leading-none font-semibold tracking-tight tabular-nums">
        {nilai}
      </p>

      {keterangan ? (
        <p className="text-muted-foreground text-xs">{keterangan}</p>
      ) : null}
    </div>
  );
}
