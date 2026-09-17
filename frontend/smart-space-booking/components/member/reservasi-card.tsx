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
    <article className="bg-card grid gap-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/reservasi/${reservasi.id}`}
            className="focus-visible:ring-ring rounded-sm font-mono text-sm font-medium hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            {reservasi.kode_booking}
          </Link>
          <p className="mt-1 truncate font-medium">
            {reservasi.space?.nama_space ?? 'Space tidak diketahui'}
          </p>
        </div>
        <StatusBadge status={reservasi.status} />
      </div>

      <div className="text-muted-foreground grid gap-1 text-sm">
        <p className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          {tanggalDanJam(
            reservasi.tanggal_reservasi,
            reservasi.jam_mulai,
            reservasi.jam_selesai,
          )}
          <span className="text-muted-foreground">({reservasi.durasi_jam} jam)</span>
        </p>
        {reservasi.space ? <TipeBadge tipe={reservasi.space.tipe} className="w-fit" /> : null}
      </div>

      <div className="flex items-end justify-between gap-3 border-t pt-3">
        <div>
          <p className="text-muted-foreground text-xs">Total bayar</p>
          <Rupiah nilai={reservasi.total_bayar} className="font-semibold" />
        </div>
        {aksi}
      </div>
    </article>
  );
}
