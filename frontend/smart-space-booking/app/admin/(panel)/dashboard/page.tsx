import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Dashboard' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Dashboard" keterangan="Ringkasan aktivitas lokasimu hari ini." />
      <Segera bagian="dashboard" />
    </div>
  );
}
