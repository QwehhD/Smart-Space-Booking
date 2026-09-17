import { Ticket } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { reservasiSaya } from '@/lib/api/reservasi';
import { sesiServer } from '@/lib/auth/server';
import { punyaETicket } from '@/lib/constants';
import { tanggalDanJam } from '@/lib/format';

export const metadata = { title: 'E-Ticket' };
export const dynamic = 'force-dynamic';

/**
 * Daftar tiket yang dapat ditunjukkan saat check-in.
 *
 * Backend tidak membatasi status apa pun untuk e-ticket, tetapi tiket reservasi
 * yang sudah dibatalkan tidak ada gunanya dibawa ke lokasi, sehingga
 * disembunyikan dari daftar ini.
 */
export default async function DaftarTiketPage() {
  const { token } = await sesiServer();
  const semua = await reservasiSaya(token);
  const tiket = semua.filter((r) => punyaETicket(r.status));

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="E-Ticket"
        keterangan="Tunjukkan tiket ini saat check-in di lokasi."
      />

      {tiket.length === 0 ? (
        <EmptyState
          icon={<Ticket className="size-8" />}
          judul="Belum ada tiket"
          keterangan="Tiket muncul setelah kamu membuat pemesanan."
          aksi={<Button size="sm" render={<Link href="/spaces">Cari space</Link>} />}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {tiket.map((r) => (
            <li key={r.id}>
              <Link
                href={`/tiket/${r.id}`}
                className="bg-card hover:bg-muted/40 focus-visible:ring-ring grid h-full gap-2 rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm">{r.kode_booking}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="truncate font-medium">
                  {r.space?.nama_space ?? 'Space tidak diketahui'}
                </p>
                <p className="text-muted-foreground text-sm">
                  {tanggalDanJam(r.tanggal_reservasi, r.jam_mulai, r.jam_selesai)}
                </p>
                <p className="mt-auto pt-1">
                  <Rupiah nilai={r.total_bayar} className="font-semibold" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
