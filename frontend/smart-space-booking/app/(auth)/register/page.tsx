import { FormRegisterMember } from '@/components/auth/form-register-member';

export const metadata = { title: 'Daftar' };

export default function RegisterMemberPage() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Buat akun</h1>
        <p className="text-muted-foreground text-sm">
          Daftar untuk memesan meja kerja dan ruang rapat per jam.
        </p>
      </div>

      <FormRegisterMember />
    </div>
  );
}
