import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Data Space' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Data Space" keterangan="Kelola ruangan dan meja kerja." />
      <Segera bagian="data space" />
    </div>
  );
}
