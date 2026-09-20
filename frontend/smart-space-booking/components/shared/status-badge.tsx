import { LABEL_STATUS, WARNA_STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { StatusReservasi } from '@/types/entities';

/** Kelas per warna ditulis utuh agar terbaca pemindai kelas Tailwind. */
const KELAS_WARNA: Record<string, { badge: string; dot: string; ping: boolean }> = {
  menunggu: {
    badge: 'bg-status-menunggu-bg/90 text-status-menunggu border-status-menunggu/30',
    dot: 'bg-status-menunggu',
    ping: true,
  },
  berhasil: {
    badge: 'bg-status-berhasil-bg/90 text-status-berhasil border-status-berhasil/30',
    dot: 'bg-status-berhasil',
    ping: false,
  },
  berjalan: {
    badge: 'bg-status-berjalan-bg/90 text-status-berjalan border-status-berjalan/30',
    dot: 'bg-status-berjalan',
    ping: true,
  },
  netral: {
    badge: 'bg-status-netral-bg/90 text-status-netral border-status-netral/30',
    dot: 'bg-status-netral',
    ping: false,
  },
  gagal: {
    badge: 'bg-status-gagal-bg/90 text-status-gagal border-status-gagal/30',
    dot: 'bg-status-gagal',
    ping: false,
  },
};

/**
 * Penanda status reservasi dengan indikator titik animasi elegan.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: StatusReservasi;
  className?: string;
}) {
  const cfg = KELAS_WARNA[WARNA_STATUS[status]] ?? KELAS_WARNA.netral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-tight whitespace-nowrap shadow-2xs transition-all duration-200',
        cfg.badge,
        className,
      )}
    >
      <span className="relative flex size-1.5 shrink-0">
        {cfg.ping ? (
          <span
            className={cn(
              'absolute -inset-0.5 rounded-full opacity-75 animate-ping',
              cfg.dot,
            )}
          />
        ) : null}
        <span className={cn('relative inline-flex size-1.5 rounded-full', cfg.dot)} />
      </span>
      {LABEL_STATUS[status]}
    </span>
  );
}
