import { BadgePercent, Clock, Receipt, Wallet } from 'lucide-react';
import { GrafikPendapatan } from '@/components/admin/grafik-pendapatan';
import { KartuStatistik } from '@/components/admin/kartu-statistik';
import { TombolCetak } from '@/components/admin/tombol-cetak';
import { PageHeader } from '@/components/layout/page-header';
import { MonthPicker } from '@/components/shared/month-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { laporanBulanan } from '@/lib/api/admin-laporan';
import { ambilProfilLokasi } from '@/lib/api/admin-profil';
import { sesiServer } from '@/lib/auth/server';
import { bacaBulanTahun } from '@/lib/bulan';
import { namaBulan, rupiah, waktuLengkap } from '@/lib/format';

export const metadata = { title: 'Rekapitulasi Pendapatan' };
export const dynamic = 'force-dynamic';

/**
 * Rekapitulasi pendapatan satu bulan.
 *
 * Bulan dan tahunnya dibaca dari URL sehingga laporan bulan tertentu dapat
 * ditautkan dan bertahan saat dimuat ulang. Seluruh angkanya datang dari
 * `GET /admin/reports/monthly` apa adanya; tidak ada yang dihitung ulang di sini,
 * supaya yang tercetak persis sama dengan yang tersimpan di backend.
 */
export default async function LaporanPage({
  searchParams,
}: PageProps<'/admin/laporan'>) {
  const { token } = await sesiServer();
  const sp = await searchParams;
  const { month, year } = bacaBulanTahun(sp.month, sp.year);

  const [laporan, profil] = await Promise.all([
    laporanBulanan(month, year, token),
    ambilProfilLokasi(token),
  ]);

  const periode = namaBulan(laporan.month, laporan.year);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Rekapitulasi Pendapatan"
        keterangan="Ringkasan pendapatan per bulan."
        aksi={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <MonthPicker month={month} year={year} />
            <TombolCetak label="Cetak laporan" />
          </div>
        }
      />

      <div className="cetak-laporan grid gap-6">
        {/* Kop hanya muncul di atas kertas; di layar konteksnya sudah jelas dari
            judul halaman dan sidebar. */}
        <header className="hidden print:block">
          <h1 className="text-xl font-semibold">
            Rekapitulasi Pendapatan {periode}
          </h1>
          <p className="text-sm">{profil.nama_coworking}</p>
          <p className="text-muted-foreground text-xs">
            Dicetak {waktuLengkap(new Date().toISOString())}
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KartuStatistik
            label="Pendapatan bersih"
            nilai={rupiah(laporan.realisasi_pendapatan_bersih)}
            keterangan={periode}
            icon={<Wallet className="size-4" />}
          />
          <KartuStatistik
            label="Pendapatan kotor"
            nilai={rupiah(laporan.estimasi_pendapatan_kotor)}
            keterangan="Sebelum potongan promo"
            icon={<Receipt className="size-4" />}
          />
          <KartuStatistik
            label="Potongan promo"
            nilai={rupiah(laporan.total_potongan_diskon)}
            keterangan="Selisih kotor dan bersih"
            icon={<BadgePercent className="size-4" />}
          />
          <KartuStatistik
            label="Transaksi"
            nilai={laporan.total_transaksi}
            keterangan={`${laporan.total_jam_terpakai} jam terpakai`}
            icon={<Clock className="size-4" />}
          />
        </section>

        <section className="bg-card grid gap-4 rounded-lg border p-4">
          <div className="grid gap-0.5 px-1">
            <h2 className="font-semibold">Pendapatan per hari</h2>
            <p className="text-muted-foreground text-xs">
              Jumlah seluruh harinya sama dengan pendapatan bersih {periode}.
            </p>
          </div>

          <GrafikPendapatan data={laporan.pendapatan_per_hari} />
        </section>

        <section className="bg-card grid gap-3 rounded-lg border p-4">
          <div className="grid gap-0.5 px-1">
            <h2 className="font-semibold">Rincian per tipe space</h2>
            <p className="text-muted-foreground text-xs">
              Reservasi yang dibatalkan tidak dihitung.
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe space</TableHead>
                  <TableHead className="text-right">Booking</TableHead>
                  <TableHead className="text-right">Jam</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {laporan.rincian_per_tipe_space.map((tipe) => (
                  <TableRow key={tipe.tipe}>
                    <TableCell className="font-medium">{tipe.label}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {tipe.total_booking}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {tipe.total_jam}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {rupiah(tipe.total_pendapatan)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell className="font-medium">Jumlah</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {laporan.total_transaksi}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {laporan.total_jam_terpakai}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {rupiah(laporan.realisasi_pendapatan_bersih)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
