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
        'group relative flex flex-col justify-between gap-3 rounded-2xl border border-border/75 bg-card/85 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md backdrop-blur-xs',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {label}
        </span>
        {icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-aksen shadow-2xs transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
        ) : null}
      </div>

      <div className="grid gap-1">
        <p className="text-2xl sm:text-[1.75rem] font-extrabold tracking-tight text-foreground tabular-nums">
          {nilai}
        </p>

        {keterangan ? (
          <p className="text-muted-foreground text-xs font-medium">{keterangan}</p>
        ) : null}
      </div>
    </div>
  );
}
