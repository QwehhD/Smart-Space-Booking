'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Penangkap kesalahan tak terduga saat merender halaman.
 *
 * Kegagalan pemanggilan API biasanya sudah ditangani di tempatnya masing-masing
 * lewat ErrorState dan notifikasi; halaman ini untuk sisanya, misalnya kesalahan
 * render yang tidak diperkirakan.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Dicatat ke konsol agar masih dapat ditelusuri saat pengembangan, sementara
    // pengguna hanya melihat pesan yang ringkas.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <TriangleAlert className="text-muted-foreground size-10" />
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Terjadi kesalahan
        </h1>
        <p className="text-muted-foreground text-sm">
          Halaman ini gagal ditampilkan. Coba muat ulang; bila masih gagal,
          kembali beberapa saat lagi.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">
            Kode: {error.digest}
          </p>
        ) : null}
      </div>
      <Button variant="outline" onClick={reset}>
        <RotateCw />
        Coba lagi
      </Button>
    </main>
  );
}
