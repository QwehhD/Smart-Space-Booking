import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Akun' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Akun" keterangan="Data dirimu di aplikasi ini." />
      <Segera bagian="akun" />
    </div>
  );
}
