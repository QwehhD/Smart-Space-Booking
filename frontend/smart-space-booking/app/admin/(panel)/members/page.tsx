import { DaftarMember } from '@/components/admin/daftar-member';
import { PageHeader } from '@/components/layout/page-header';
import { daftarMember } from '@/lib/api/admin-members';
import { sesiServer } from '@/lib/auth/server';

export const metadata = { title: 'Member' };
export const dynamic = 'force-dynamic';

/** Pengelolaan akun member. */
export default async function MembersPage() {
  const { token } = await sesiServer();
  const members = await daftarMember(undefined, token);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Member"
        keterangan="Akun penyewa yang terdaftar di aplikasi."
      />

      <DaftarMember awal={members} />
    </div>
  );
}
