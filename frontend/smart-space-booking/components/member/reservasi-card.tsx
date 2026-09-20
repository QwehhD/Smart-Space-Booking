import { Clock } from 'lucide-react';
import Link from 'next/link';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { tanggalDanJam } from '@/lib/format';
import type { ReservasiRingkas } from '@/types/entities';

/**
 * Kartu satu pemesanan pada daftar milik member.
 *
 * `space` dapat bernilai null bila rincian reservasinya hilang, sehingga setiap
 * bagian yang bergantung padanya diberi pengganti agar kartunya tetap utuh.
 */
export function ReservasiCard({
  reservasi,
  aksi,
}: {
  reservasi: ReservasiRingkas;
  aksi?: React.ReactNode;
}) {
  return (
    <article className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/75 bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/reservasi/${reservasi.id}`}
            className="focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm font-mono text-xs font-bold text-primary hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            {reservasi.kode_booking}
          </Link>
          <h3 className="mt-1 truncate font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {reservasi.space?.nama_space ?? 'Space tidak diketahui'}
          </h3>
        </div>
        <StatusBadge status={reservasi.status} />
      </div>

      <div className="grid gap-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5 font-medium">
          <Clock className="size-3.5 shrink-0 text-primary/70" />
          <span>
            {tanggalDanJam(
              reservasi.tanggal_reservasi,
              reservasi.jam_mulai,
              reservasi.jam_selesai,
            )}
          </span>
          <span className="text-muted-foreground/80 font-normal">({reservasi.durasi_jam} jam)</span>
        </p>
        {reservasi.space ? <TipeBadge tipe={reservasi.space.tipe} className="w-fit" /> : null}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-3.5">
        <div>
          <p className="text-[11px] text-muted-foreground">Total bayar</p>
          <Rupiah nilai={reservasi.total_bayar} className="text-base font-bold text-foreground" />
        </div>
        {aksi}
      </div>
    </article>
  );
}
