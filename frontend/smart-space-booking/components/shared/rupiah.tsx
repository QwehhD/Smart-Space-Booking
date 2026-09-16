import { rupiah } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Nilai rupiah. Angkanya memakai lebar digit seragam supaya kolom nominal pada
 * tabel tetap lurus meski nilainya berbeda panjang.
 */
export function Rupiah({
  nilai,
  className,
}: {
  nilai: number;
  className?: string;
}) {
  return (
    <span className={cn('tabular-nums', className)}>{rupiah(nilai)}</span>
  );
}
