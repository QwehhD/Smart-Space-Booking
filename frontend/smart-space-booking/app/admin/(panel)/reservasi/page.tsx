import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Semua Reservasi' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Semua Reservasi" keterangan="Seluruh pemesanan di lokasimu." />
      <Segera bagian="daftar reservasi" />
    </div>
  );
}
