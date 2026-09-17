import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Data Diskon' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Data Diskon" keterangan="Kelola kode promo dan periodenya." />
      <Segera bagian="data diskon" />
    </div>
  );
}
