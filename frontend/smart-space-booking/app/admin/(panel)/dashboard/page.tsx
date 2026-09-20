import {
  BadgePercent,
  CalendarCheck,
  ClockAlert,
  LayoutGrid,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { BarisAgenda } from '@/components/admin/baris-agenda';
import { KartuStatistik } from '@/components/admin/kartu-statistik';
import { PanelDaftar } from '@/components/admin/panel-daftar';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ambilProfilLokasi } from '@/lib/api/admin-profil';
import { daftarReservasiAdmin } from '@/lib/api/admin-reservasi';
import { daftarSpaceAdmin } from '@/lib/api/admin-spaces';
import { laporanBulanan } from '@/lib/api/admin-laporan';
import { sesiServer } from '@/lib/auth/server';
import { hariIniWib, namaBulan, rupiah, tanggalDenganHari } from '@/lib/format';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

/** Sebanyak ini saja yang ditampilkan; selebihnya lewat tautan lihat semua. */
const MAKS_BARIS = 6;

/**
 * Ringkasan harian pengelola.
 *
 * Backend tidak menyediakan endpoint dashboard, jadi halaman ini dirangkai dari
 * endpoint yang sudah ada: laporan bulan berjalan untuk angka pendapatan,
 * daftar reservasi tersaring tanggal hari ini untuk agenda, daftar tersaring
 * status untuk antrean konfirmasi, dan daftar space untuk jumlah ruangan.
 * Seluruhnya diminta serentak supaya waktu muatnya ditentukan permintaan
 * terlama, bukan jumlah seluruhnya.
 */
export default async function DashboardPage() {
  const { token } = await sesiServer();
  const hariIni = hariIniWib();
  const [tahun, bulan] = hariIni.split('-').map(Number);

  const [profil, laporan, agenda, menunggu, spaces] = await Promise.all([
    ambilProfilLokasi(token),
    laporanBulanan(bulan, tahun, token),
    daftarReservasiAdmin({ tanggal: hariIni }, token),
    daftarReservasiAdmin({ status: 'belum_dikonfirm' }, token),
    daftarSpaceAdmin(token),
  ]);

  // Agenda diurutkan menaik supaya yang paling dekat berada di atas; backend
  // mengurutkan daftarnya dari yang terbaru dibuat, bukan dari jamnya.
  const agendaTerurut = [...agenda].sort((a, b) =>
    a.jam_mulai.localeCompare(b.jam_mulai),
  );

  const sedangBerlangsung = agenda.filter((r) => r.status === 'aktif').length;

  return (
    <div className="grid gap-6">
      <PageHeader
        judul={`Halo, ${profil.nama_coworking}`}
        keterangan={tanggalDenganHari(hariIni)}
        aksi={
          <Button variant="outline" render={<Link href="/admin/reservasi">
            <CalendarCheck />
            Kelola reservasi
          </Link>} />
        }
      />

      <section className="masuk-berurut grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KartuStatistik
          label="Pendapatan bersih"
          nilai={rupiah(laporan.realisasi_pendapatan_bersih)}
          keterangan={`${namaBulan(bulan, tahun)} • ${laporan.total_transaksi} transaksi`}
          icon={<Wallet className="size-4" />}
        />
        <KartuStatistik
          label="Potongan promo"
          nilai={rupiah(laporan.total_potongan_diskon)}
          keterangan={`Dari kotor ${rupiah(laporan.estimasi_pendapatan_kotor)}`}
          icon={<BadgePercent className="size-4" />}
        />
        <KartuStatistik
          label="Agenda hari ini"
          nilai={agenda.length}
          keterangan={
            sedangBerlangsung > 0
              ? `${sedangBerlangsung} sedang berlangsung`
              : `${laporan.total_jam_terpakai} jam terpakai bulan ini`
          }
          icon={<CalendarCheck className="size-4" />}
        />
        <KartuStatistik
          label="Perlu dikonfirmasi"
          nilai={menunggu.length}
          keterangan={
            menunggu.length > 0
              ? 'Menunggu persetujuanmu'
              : 'Tidak ada yang tertunda'
          }
          icon={<ClockAlert className="size-4" />}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelDaftar
          judul="Agenda hari ini"
          keterangan={tanggalDenganHari(hariIni)}
          href="/admin/reservasi"
        >
          {agendaTerurut.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck className="size-7" />}
              judul="Belum ada pemesanan hari ini"
              keterangan="Pemesanan yang masuk untuk hari ini akan muncul di sini."
              className="py-8"
            />
          ) : (
            <div className="grid">
              {agendaTerurut.slice(0, MAKS_BARIS).map((item) => (
                <BarisAgenda key={item.id} item={item} />
              ))}

              {agendaTerurut.length > MAKS_BARIS ? (
                <p className="text-muted-foreground px-3 pt-2 text-xs">
                  dan {agendaTerurut.length - MAKS_BARIS} lainnya hari ini.
                </p>
              ) : null}
            </div>
          )}
        </PanelDaftar>

        <PanelDaftar
          judul="Perlu dikonfirmasi"
          keterangan="Pemesanan yang menunggu persetujuan"
          href="/admin/reservasi"
        >
          {menunggu.length === 0 ? (
            <EmptyState
              icon={<ClockAlert className="size-7" />}
              judul="Semua sudah ditangani"
              keterangan="Tidak ada pemesanan yang menunggu persetujuan."
              className="py-8"
            />
          ) : (
            <div className="grid">
              {menunggu.slice(0, MAKS_BARIS).map((item) => (
                <BarisAgenda key={item.id} item={item} />
              ))}

              {menunggu.length > MAKS_BARIS ? (
                <p className="text-muted-foreground px-3 pt-2 text-xs">
                  dan {menunggu.length - MAKS_BARIS} lainnya menunggu.
                </p>
              ) : null}
            </div>
          )}
        </PanelDaftar>
      </div>

      <section className="bg-card shadow-xs grid gap-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="grid gap-0.5">
            <h2 className="font-semibold">Ruangan bulan ini</h2>
            <p className="text-muted-foreground text-xs">
              {spaces.length} ruangan aktif • {namaBulan(bulan, tahun)}
            </p>
          </div>

          <Button variant="outline" size="sm" render={<Link href="/admin/spaces">
            <LayoutGrid />
            Kelola ruangan
          </Link>} />
        </div>

        <dl className="grid gap-2 sm:grid-cols-3">
          {laporan.rincian_per_tipe_space.map((tipe) => (
            <div key={tipe.tipe} className="bg-muted/40 grid gap-1 rounded-md p-3">
              <dt className="text-muted-foreground text-xs font-medium">
                {tipe.label}
              </dt>
              <dd className="font-semibold tabular-nums">
                {rupiah(tipe.total_pendapatan)}
              </dd>
              <dd className="text-muted-foreground text-xs tabular-nums">
                {tipe.total_booking} booking • {tipe.total_jam} jam
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
