import type { ReactNode } from 'react';

/** Judul halaman beserta aksi di kanannya, seragam di seluruh aplikasi. */
export function PageHeader({
  judul,
  keterangan,
  aksi,
}: {
  judul: string;
  keterangan?: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {judul}
        </h1>
        {keterangan ? (
          <p className="text-muted-foreground text-sm">{keterangan}</p>
        ) : null}
      </div>
      {aksi ? <div className="flex items-center gap-2">{aksi}</div> : null}
    </div>
  );
}
