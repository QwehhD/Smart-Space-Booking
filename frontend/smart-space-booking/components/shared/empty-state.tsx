import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Keadaan kosong. Selalu menyertakan ajakan bertindak bila ada yang bisa
 * dilakukan pengguna, sehingga halaman kosong tidak terasa seperti kegagalan.
 */
export function EmptyState({
  icon,
  judul,
  keterangan,
  aksi,
  className,
}: {
  icon?: ReactNode;
  judul: string;
  keterangan?: string;
  aksi?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-muted/30 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="bg-background text-muted-foreground ring-border grid size-14 place-items-center rounded-full ring-1">
          {icon}
        </div>
      ) : null}
      <div className="grid gap-1">
        <p className="font-medium">{judul}</p>
        {keterangan ? (
          <p className="text-muted-foreground max-w-sm text-sm">{keterangan}</p>
        ) : null}
      </div>
      {aksi}
    </div>
  );
}
