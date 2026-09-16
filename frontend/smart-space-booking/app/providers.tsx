'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ApiError } from '@/lib/api/error';

/**
 * Penyedia lintas halaman: cache TanStack Query dan notifikasi.
 *
 * QueryClient dibuat di dalam state, bukan di tingkat modul, supaya setiap
 * render di server memakai cache-nya sendiri dan data satu pengguna tidak pernah
 * bocor ke pengguna lain.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // Percobaan ulang tidak masuk akal untuk kesalahan yang sudah pasti,
            // misalnya sesi berakhir atau data tidak ditemukan.
            retry: (gagalKe, error) => {
              if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
                return false;
              }

              return gagalKe < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
