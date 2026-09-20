import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { TombolLogout } from '@/components/member/tombol-logout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ambilProfil } from '@/lib/api/auth';
import { sesiServer } from '@/lib/auth/server';
import { inisial, waktuLengkap } from '@/lib/format';

export const metadata = { title: 'Akun' };
export const dynamic = 'force-dynamic';

/**
 * Data diri member, hanya dapat dibaca.
 *
 * Backend tidak menyediakan endpoint bagi member untuk mengubah profilnya
 * sendiri; perubahan data member dilakukan pengelola lewat panel admin. Halaman
 * ini karena itu tidak memiliki form, dan menyebutkan ke mana harus menghubungi.
 */
export default async function AkunPage() {
  const { token } = await sesiServer();
  const profil = await ambilProfil(token);
  const member = profil.member;

  // Halaman ini hanya untuk member; pengelola punya halaman profil lokasinya.
  if (!member) {
    redirect('/admin/profil');
  }

  return (
    <div className="grid gap-6">
      <PageHeader judul="Akun" keterangan="Data dirimu di aplikasi ini." />

      <div className="bg-card shadow-xs grid gap-4 rounded-xl border p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {member.foto_url ? (
              <AvatarImage src={member.foto_url} alt={member.nama_member} />
            ) : null}
            <AvatarFallback className="text-lg">
              {inisial(member.nama_member)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{member.nama_member}</p>
            <p className="text-muted-foreground truncate text-sm">
              @{profil.username}
            </p>
          </div>
        </div>

        <dl className="grid gap-2.5 border-t pt-4 text-sm">
          <Baris label="Instansi" nilai={member.instansi} />
          <Baris label="No. telepon" nilai={member.telp} />
          <Baris label="Alamat" nilai={member.alamat} />
          <Baris label="Bergabung" nilai={waktuLengkap(member.created_at)} />
        </dl>
      </div>

      <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
        Hubungi pengelola coworking space untuk mengubah data dirimu.
      </p>

      <TombolLogout />
    </div>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right">{nilai}</dd>
    </div>
  );
}
