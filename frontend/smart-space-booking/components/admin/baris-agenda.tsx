import Link from 'next/link';
import { StatusBadge } from '@/components/shared/status-badge';
import { Rupiah } from '@/components/shared/rupiah';
import type { ReservasiAdmin } from '@/types/entities';

/**
 * Satu baris pemesanan pada daftar ringkas dashboard.
 *
 * Seluruh barisnya menautkan ke halaman reservasi, bukan menyediakan tombol aksi
 * sendiri, supaya persetujuan dan check-in hanya ada di satu tempat dan tidak
 * tersebar dalam dua alur yang harus dijaga sama.
 */
export function BarisAgenda({ item }: { item: ReservasiAdmin }) {
  return (
    <Link
      href={`/admin/reservasi?kode=${item.kode_booking}`}
      className="hover:bg-accent/60 flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors"
    >
      <div className="grid w-14 shrink-0 text-center">
        <span className="text-sm font-semibold tabular-nums">
          {item.jam_mulai}
        </span>
        <span className="text-muted-foreground text-xs tabular-nums">
          {item.jam_selesai}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.space?.nama_space ?? 'Space sudah dihapus'}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {item.member.nama_member} • {item.kode_booking}
        </p>
      </div>

      <div className="grid shrink-0 justify-items-end gap-1">
        <StatusBadge status={item.status} />
        <Rupiah nilai={item.total_bayar} className="text-muted-foreground text-xs" />
      </div>
    </Link>
  );
}
