'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ApiError } from '@/lib/api/error';

/**
 * Penyedia lintas halaman: tema, cache TanStack Query, dan notifikasi.
 *
 * QueryClient dibuat di dalam state, bukan di tingkat modul, supaya setiap
 * render di server memakai cache-nya sendiri dan data satu pengguna tidak pernah
 * bocor ke pengguna lain.
 *
 * Tema memakai `next-themes` dengan `attribute="class"`, sesuai varian
 * `@custom-variant dark (&:is(.dark *))` di `globals.css`. Pustaka itu
 * menyisipkan skrip kecil yang berjalan sebelum halaman digambar, sehingga tema
 * gelap tidak berkedip putih sesaat saat dimuat ulang.
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
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Transisi warna dimatikan sesaat ketika tema berpindah. Tanpa ini,
      // setiap permukaan beranimasi sendiri-sendiri dengan durasi berbeda dan
      // perpindahannya terlihat berantakan alih-alih serentak.
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
