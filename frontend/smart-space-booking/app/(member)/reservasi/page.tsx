import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Status Pemesanan' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Status Pemesanan" keterangan="Pantau status seluruh pemesananmu." />
      <Segera bagian="status pemesanan" />
    </div>
  );
}
