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
      className="group flex items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all duration-200 hover:bg-accent/50 hover:translate-x-0.5"
    >
      <div className="grid w-14 shrink-0 rounded-lg bg-muted/50 py-1 text-center border border-border/60 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
        <span className="text-xs font-bold tabular-nums text-foreground">
          {item.jam_mulai}
        </span>
        <span className="text-muted-foreground text-[10px] tabular-nums font-medium">
          {item.jam_selesai}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
          {item.space?.nama_space ?? 'Space sudah dihapus'}
        </p>
        <p className="text-muted-foreground truncate text-xs mt-0.5 font-medium">
          {item.member.nama_member} • <span className="font-mono">{item.kode_booking}</span>
        </p>
      </div>

      <div className="grid shrink-0 justify-items-end gap-1">
        <StatusBadge status={item.status} />
        <Rupiah nilai={item.total_bayar} className="text-muted-foreground text-xs font-semibold tabular-nums" />
      </div>
    </Link>
  );
}
