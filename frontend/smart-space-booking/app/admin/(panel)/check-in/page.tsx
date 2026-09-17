import { PanelCheckIn } from '@/components/admin/panel-check-in';
import { PageHeader } from '@/components/layout/page-header';
import { daftarReservasiAdmin } from '@/lib/api/admin-reservasi';
import { sesiServer } from '@/lib/auth/server';
import { hariIniWib } from '@/lib/format';

export const metadata = { title: 'Check-in' };
export const dynamic = 'force-dynamic';

/**
 * Meja depan: mencatat kedatangan dan kepulangan tamu.
 *
 * Agenda hari ini diambil sekali di server, lalu pencocokan kode booking
 * dilakukan di klien atas data itu, karena backend tidak menyediakan endpoint
 * pencarian kode booking maupun verifikasi QR.
 */
export default async function CheckInPage() {
  const { token } = await sesiServer();
  const tanggal = hariIniWib();
  const agenda = await daftarReservasiAdmin({ tanggal }, token);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Check-in"
        keterangan="Pindai QR atau masukkan kode booking."
      />

      <PanelCheckIn awal={agenda} tanggal={tanggal} />
    </div>
  );
}
