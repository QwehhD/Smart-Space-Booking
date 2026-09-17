import { ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { MonthPicker } from '@/components/shared/month-picker';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { historiSaya } from '@/lib/api/reservasi';
import { sesiServer } from '@/lib/auth/server';
import { bacaBulanTahun } from '@/lib/bulan';
import { namaBulan, tanggalDanJam } from '@/lib/format';

export const metadata = { title: 'Histori Pemesanan' };
export const dynamic = 'force-dynamic';

/**
 * Histori pemesanan per bulan.
 *
 * Rekap totalnya diambil dari backend, bukan dijumlahkan di klien, sehingga
 * aturan mana yang ikut dihitung tetap satu: reservasi yang dibatalkan tetap
 * tampil pada daftar tetapi tidak menambah pengeluaran.
 */
export default async function HistoriPage({
  searchParams,
}: PageProps<'/reservasi/histori'>) {
  const { month: m, year: y } = await searchParams;
  const { month, year } = bacaBulanTahun(m, y);
  const { token } = await sesiServer();

  const histori = await historiSaya(month, year, token);

  return (
    <div className="grid gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        render={
          <Link href="/reservasi">
            <ArrowLeft />
            Kembali ke status pemesanan
          </Link>
        }
      />

      <PageHeader
        judul="Histori Pemesanan"
        keterangan={`Rekap pemesananmu pada ${namaBulan(month, year)}.`}
        aksi={
          <Suspense fallback={<Skeleton className="h-9 w-64" />}>
            <MonthPicker month={month} year={year} />
          </Suspense>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Total reservasi</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {histori.total_reservasi}
          </p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <p className="text-muted-foreground text-xs">Total pengeluaran</p>
          <p className="mt-1 text-2xl font-semibold">
            <Rupiah nilai={histori.total_pengeluaran} />
          </p>
        </div>
      </div>

      {histori.items.length === 0 ? (
        <EmptyState
          icon={<Receipt className="size-8" />}
          judul={`Tidak ada pemesanan pada ${namaBulan(month, year)}`}
          keterangan="Pilih bulan lain untuk melihat riwayat yang lain."
        />
      ) : (
        <ul className="grid gap-3">
          {histori.items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/reservasi/${item.id}`}
                className="bg-card hover:bg-muted/40 focus-visible:ring-ring grid gap-2 rounded-lg border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm">{item.kode_booking}</p>
                    <p className="mt-0.5 truncate font-medium">
                      {item.space_name ?? 'Space tidak diketahui'}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    {tanggalDanJam(
                      item.tanggal_reservasi,
                      item.jam_mulai,
                      item.jam_selesai,
                    )}
                  </span>
                  <Rupiah nilai={item.total_bayar} className="text-foreground font-medium" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
