import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Data Member' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Data Member" keterangan="Kelola data pelanggan." />
      <Segera bagian="data member" />
    </div>
  );
}
