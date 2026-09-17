import { PageHeader } from '@/components/layout/page-header';
import { Segera } from '@/components/layout/segera';

export const metadata = { title: 'Rekapitulasi Pendapatan' };

export default function Halaman() {
  return (
    <div className="grid gap-6">
      <PageHeader judul="Rekapitulasi Pendapatan" keterangan="Ringkasan pendapatan per bulan." />
      <Segera bagian="laporan" />
    </div>
  );
}
