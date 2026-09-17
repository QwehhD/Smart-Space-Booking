import { DaftarSpace } from '@/components/admin/daftar-space';
import { PageHeader } from '@/components/layout/page-header';
import { daftarSpaceAdmin } from '@/lib/api/admin-spaces';
import { sesiServer } from '@/lib/auth/server';

export const metadata = { title: 'Space' };
export const dynamic = 'force-dynamic';

/**
 * Pengelolaan ruangan dan meja.
 *
 * Daftar awalnya diambil di server agar langsung terlihat, lalu diserahkan ke
 * komponen klien yang menangani penambahan, perubahan, dan penghapusannya.
 */
export default async function SpacesPage() {
  const { token } = await sesiServer();
  const spaces = await daftarSpaceAdmin(token);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Space"
        keterangan="Ruangan dan meja yang kamu sewakan."
      />

      <DaftarSpace awal={spaces} />
    </div>
  );
}
