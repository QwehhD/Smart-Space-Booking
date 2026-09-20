import { Clock, LogIn, LogOut, Phone, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { tanggalDanJam, waktuLengkap } from '@/lib/format';
import type { ReservasiAdmin } from '@/types/entities';

/**
 * Kartu satu pemesanan pada panel pengelola.
 *
 * Berbeda dari kartu milik member, di sini yang ditonjolkan adalah siapa tamunya
 * dan bagaimana menghubunginya, karena itulah yang dibutuhkan saat menyetujui
 * atau menerima kedatangan. Nomor telepon dibuat dapat ditekan agar di ponsel
 * langsung menyambung ke aplikasi telepon.
 *
 * `space` dapat bernilai null bila rincian reservasinya hilang, sehingga setiap
 * bagian yang bergantung padanya diberi pengganti.
 */
export function KartuReservasiAdmin({
  reservasi,
  aksi,
}: {
  reservasi: ReservasiAdmin;
  aksi?: ReactNode;
}) {
  return (
    <article className="group relative flex flex-col gap-3.5 rounded-2xl border border-border/75 bg-card/85 p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md backdrop-blur-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold text-primary">{reservasi.kode_booking}</p>
          <h3 className="mt-1 truncate font-bold text-base text-foreground group-hover:text-primary transition-colors">
            {reservasi.space?.nama_space ?? 'Space sudah dihapus'}
          </h3>
        </div>
        <StatusBadge status={reservasi.status} />
      </div>

      <div className="grid gap-2 text-xs text-muted-foreground">
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

        <p className="flex items-center gap-1.5">
          <User className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-bold text-foreground truncate">
            {reservasi.member.nama_member}
          </span>
        </p>

        <p className="flex items-center gap-1.5">
          <Phone className="size-3.5 shrink-0 text-muted-foreground" />
          <a
            href={`tel:${reservasi.member.telp}`}
            className="text-primary font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-xs"
          >
            {reservasi.member.telp}
          </a>
        </p>

        {reservasi.check_in_time ? (
          <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <LogIn className="size-3.5 shrink-0" />
            Check-in: {waktuLengkap(reservasi.check_in_time)}
          </p>
        ) : null}

        {reservasi.check_out_time ? (
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <LogOut className="size-3.5 shrink-0" />
            Check-out: {waktuLengkap(reservasi.check_out_time)}
          </p>
        ) : null}

        {reservasi.space ? (
          <TipeBadge tipe={reservasi.space.tipe} className="mt-1 w-fit" />
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-border/60 pt-3.5">
        <div>
          <p className="text-[11px] text-muted-foreground font-medium">
            {reservasi.potongan_diskon > 0
              ? `Setelah diskon ${reservasi.potongan_diskon.toLocaleString('id-ID')}`
              : 'Total bayar'}
          </p>
          <Rupiah nilai={reservasi.total_bayar} className="text-base font-bold text-foreground" />
        </div>
        {aksi}
      </div>
    </article>
  );
}
