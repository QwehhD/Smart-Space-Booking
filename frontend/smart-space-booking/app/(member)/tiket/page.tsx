import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'E-Ticket' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="E-Ticket" keterangan="Tiket yang bisa ditunjukkan saat check-in." />
      <Segera bagian="e-ticket" />
    </div>
  );
}
