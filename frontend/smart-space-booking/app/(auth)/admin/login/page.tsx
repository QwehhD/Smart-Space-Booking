import { FormLogin } from '@/components/auth/form-login';

export const metadata = { title: 'Masuk Pengelola' };

export default async function LoginAdminPage({
  searchParams,
}: PageProps<'/admin/login'>) {
  const { next } = await searchParams;

  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          Panel Pengelola
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Masuk sebagai pengelola
        </h1>
        <p className="text-muted-foreground text-sm">
          Kelola ruangan, kode promo, dan reservasi di lokasimu.
        </p>
      </div>

      <FormLogin
        roleDiharapkan="admin_space"
        next={typeof next === 'string' ? next : undefined}
        tautanDaftar="/admin/register"
      />

      <p className="text-muted-foreground border-t pt-4 text-center text-sm">
        Ingin memesan ruangan?{' '}
        <a href="/login" className="text-primary font-medium hover:underline">
          Masuk sebagai member
        </a>
      </p>
    </div>
  );
}
