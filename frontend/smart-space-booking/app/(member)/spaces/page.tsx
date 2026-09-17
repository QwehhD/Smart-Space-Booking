import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Ketersediaan Space' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Ketersediaan Space" keterangan="Cari meja kerja atau ruang rapat yang tersedia." />
      <Segera bagian="katalog space" />
    </div>
  );
}
