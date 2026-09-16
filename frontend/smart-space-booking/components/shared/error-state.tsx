'use client';

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error';
import { cn } from '@/lib/utils';

/**
 * Keadaan gagal memuat, dengan tombol coba lagi.
 *
 * Pesan dari backend ditampilkan apa adanya karena sudah berbahasa Indonesia dan
 * menjelaskan sebabnya; kegagalan lain diberi pesan umum.
 */
export function ErrorState({
  error,
  onCobaLagi,
  className,
}: {
  error: unknown;
  onCobaLagi?: () => void;
  className?: string;
}) {
  const pesan =
    error instanceof ApiError
      ? error.message
      : 'Terjadi kesalahan saat memuat data.';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      <p className="font-medium">Gagal memuat data</p>
      <p className="text-muted-foreground max-w-sm text-sm">{pesan}</p>
      {onCobaLagi ? (
        <Button variant="outline" size="sm" onClick={onCobaLagi}>
          <RotateCw />
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
