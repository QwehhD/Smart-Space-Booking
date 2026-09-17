import { DaftarDiskon } from '@/components/admin/daftar-diskon';
import { PageHeader } from '@/components/layout/page-header';
import { daftarDiskonAdmin } from '@/lib/api/admin-diskon';
import { sesiServer } from '@/lib/auth/server';

export const metadata = { title: 'Diskon' };
export const dynamic = 'force-dynamic';

/** Pengelolaan kode promo milik lokasi ini. */
export default async function DiskonPage() {
  const { token } = await sesiServer();
  const daftar = await daftarDiskonAdmin(token);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Diskon"
        keterangan="Kode promo yang berlaku untuk space milikmu."
      />

      <DaftarDiskon awal={daftar} />
    </div>
  );
}
