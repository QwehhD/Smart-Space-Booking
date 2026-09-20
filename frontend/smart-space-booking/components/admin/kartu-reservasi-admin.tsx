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
    <article className="bg-card shadow-xs grid gap-3 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium">{reservasi.kode_booking}</p>
          <p className="mt-1 truncate font-medium">
            {reservasi.space?.nama_space ?? 'Space sudah dihapus'}
          </p>
        </div>
        <StatusBadge status={reservasi.status} />
      </div>

      <div className="text-muted-foreground grid gap-1.5 text-sm">
        <p className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          {tanggalDanJam(
            reservasi.tanggal_reservasi,
            reservasi.jam_mulai,
            reservasi.jam_selesai,
          )}
          <span>({reservasi.durasi_jam} jam)</span>
        </p>

        <p className="flex items-center gap-1.5">
          <User className="size-3.5 shrink-0" />
          <span className="text-foreground truncate">
            {reservasi.member.nama_member}
          </span>
        </p>

        <p className="flex items-center gap-1.5">
          <Phone className="size-3.5 shrink-0" />
          <a
            href={`tel:${reservasi.member.telp}`}
            className="hover:text-foreground focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            {reservasi.member.telp}
          </a>
        </p>

        {reservasi.check_in_time ? (
          <p className="flex items-center gap-1.5">
            <LogIn className="size-3.5 shrink-0" />
            Masuk {waktuLengkap(reservasi.check_in_time)}
          </p>
        ) : null}

        {reservasi.check_out_time ? (
          <p className="flex items-center gap-1.5">
            <LogOut className="size-3.5 shrink-0" />
            Keluar {waktuLengkap(reservasi.check_out_time)}
          </p>
        ) : null}

        {reservasi.space ? (
          <TipeBadge tipe={reservasi.space.tipe} className="mt-0.5 w-fit" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-3">
        <div>
          <p className="text-muted-foreground text-xs">
            {reservasi.potongan_diskon > 0
              ? `Setelah potongan ${reservasi.potongan_diskon.toLocaleString('id-ID')}`
              : 'Total bayar'}
          </p>
          <Rupiah nilai={reservasi.total_bayar} className="font-semibold" />
        </div>
        {aksi}
      </div>
    </article>
  );
}
