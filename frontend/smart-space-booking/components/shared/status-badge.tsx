import { LABEL_STATUS, WARNA_STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { StatusReservasi } from '@/types/entities';

/** Kelas per warna ditulis utuh agar terbaca pemindai kelas Tailwind. */
const KELAS_WARNA: Record<string, string> = {
  menunggu: 'bg-status-menunggu-bg text-status-menunggu',
  berhasil: 'bg-status-berhasil-bg text-status-berhasil',
  berjalan: 'bg-status-berjalan-bg text-status-berjalan',
  netral: 'bg-status-netral-bg text-status-netral',
  gagal: 'bg-status-gagal-bg text-status-gagal',
};

/**
 * Penanda status reservasi.
 *
 * Satu-satunya tempat status diterjemahkan menjadi warna dan label, sehingga
 * status yang sama tidak pernah tampil berbeda antar halaman.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: StatusReservasi;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        KELAS_WARNA[WARNA_STATUS[status]],
        className,
      )}
    >
      {LABEL_STATUS[status]}
    </span>
  );
}
