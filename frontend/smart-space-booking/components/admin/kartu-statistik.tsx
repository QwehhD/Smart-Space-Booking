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
    <div className={cn('bg-card grid gap-2 rounded-lg border p-4', className)}>
      <div className="text-muted-foreground flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        {icon}
      </div>

      <p className="text-2xl font-semibold tabular-nums">{nilai}</p>

      {keterangan ? (
        <p className="text-muted-foreground text-xs">{keterangan}</p>
      ) : null}
    </div>
  );
}
