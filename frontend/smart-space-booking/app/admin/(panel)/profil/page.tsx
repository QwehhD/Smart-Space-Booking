import { FormProfilLokasi } from '@/components/admin/form-profil-lokasi';
import { PageHeader } from '@/components/layout/page-header';
import { ambilProfilLokasi } from '@/lib/api/admin-profil';
import { sesiServer } from '@/lib/auth/server';

export const metadata = { title: 'Profil Lokasi' };
export const dynamic = 'force-dynamic';

/**
 * Profil lokasi coworking space yang dikelola.
 *
 * Datanya diambil di server supaya form sudah terisi pada render pertama, tanpa
 * kedipan keadaan kosong; penyuntingannya ditangani komponen klien.
 */
export default async function ProfilPage() {
  const { token } = await sesiServer();
  const profil = await ambilProfilLokasi(token);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Profil Lokasi"
        keterangan="Data coworking space yang kamu kelola."
      />

      <FormProfilLokasi profil={profil} />
    </div>
  );
}
