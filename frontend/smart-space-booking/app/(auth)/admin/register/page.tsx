import { FormRegisterAdmin } from '@/components/auth/form-register-admin';

export const metadata = { title: 'Daftarkan Lokasi' };

export default function RegisterAdminPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <p className="text-aksen font-mono text-xs tracking-widest uppercase">
          Panel Pengelola
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Daftarkan coworking space
        </h1>
        <p className="text-muted-foreground text-sm">
          Buat akun pengelola beserta profil lokasimu.
        </p>
      </div>

      <FormRegisterAdmin />
    </div>
  );
}
