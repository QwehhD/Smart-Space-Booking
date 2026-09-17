import { Hammer } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * Penanda halaman yang kerangkanya sudah ada tetapi isinya dikerjakan pada tahap
 * berikutnya. Dipakai agar navigasi dan proteksi route dapat diuji lebih awal.
 */
export function Segera({ bagian }: { bagian: string }) {
  return (
    <EmptyState
      icon={<Hammer className="size-8" />}
      judul="Sedang disiapkan"
      keterangan={`Halaman ${bagian} akan diisi pada tahap berikutnya.`}
    />
  );
}
