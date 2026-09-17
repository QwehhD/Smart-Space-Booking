import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Detail Reservasi' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Detail Reservasi" keterangan="Rincian satu pemesanan." />
      <Segera bagian="detail reservasi" />
    </div>
  );
}
