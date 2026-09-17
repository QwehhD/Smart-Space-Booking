import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Profil Lokasi' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Profil Lokasi" keterangan="Data coworking space yang kamu kelola." />
      <Segera bagian="profil lokasi" />
    </div>
  );
}
