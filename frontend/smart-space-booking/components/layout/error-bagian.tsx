'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Isi penangkap kesalahan untuk satu bagian aplikasi.
 *
 * Berbeda dari `app/error.tsx` yang menggantikan seluruh halaman, komponen ini
 * dipakai oleh `error.tsx` di dalam layout member dan panel pengelola, sehingga
 * navigasinya tetap terlihat dan pengguna dapat berpindah ke halaman lain tanpa
 * harus memuat ulang.
 *
 * Pesan dari backend tidak ditampilkan di sini. Kegagalan pemanggilan API yang
 * dapat dijelaskan sudah ditangani di tempatnya masing-masing lewat `ErrorState`
 * dan notifikasi; yang sampai ke sini adalah sisanya, yang pesan aslinya belum
 * tentu berguna bagi pengguna.
 */
export function ErrorBagian({
  error,
  reset,
  tautanPulang,
  labelPulang,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  tautanPulang: string;
  labelPulang: string;
}) {
  useEffect(() => {
    // Dicatat ke konsol agar masih dapat ditelusuri saat pengembangan.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <TriangleAlert className="text-muted-foreground size-10" />

      <div className="grid gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Halaman ini gagal dimuat
        </h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          Coba muat ulang bagian ini. Bila masih gagal, periksa koneksimu atau
          kembali beberapa saat lagi.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">
            Kode: {error.digest}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCw />
          Coba lagi
        </Button>
        <Button variant="outline" render={<Link href={tautanPulang}>{labelPulang}</Link>} />
      </div>
    </div>
  );
}
