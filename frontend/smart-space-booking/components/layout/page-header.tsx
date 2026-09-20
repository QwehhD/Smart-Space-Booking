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
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="grid gap-1.5">
        <h1 className="text-[1.65rem] leading-tight font-semibold tracking-tight text-balance">
          {judul}
        </h1>
        {keterangan ? (
          <p className="text-muted-foreground max-w-prose text-sm">
            {keterangan}
          </p>
        ) : null}
      </div>
      {aksi ? (
        <div className="flex flex-wrap items-center gap-2">{aksi}</div>
      ) : null}
    </div>
  );
}
