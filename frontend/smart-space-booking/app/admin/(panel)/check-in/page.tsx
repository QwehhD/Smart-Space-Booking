import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Check-in' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Check-in" keterangan="Pindai QR atau masukkan kode booking." />
      <Segera bagian="check-in" />
    </div>
  );
}
