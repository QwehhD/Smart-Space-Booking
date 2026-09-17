import { FormLogin } from '@/components/auth/form-login';

export const metadata = { title: 'Masuk' };

export default async function LoginMemberPage({
  searchParams,
}: PageProps<'/login'>) {
  // searchParams berupa Promise pada Next.js 16 dan harus ditunggu.
  const { next } = await searchParams;

  return (
    <div className="grid gap-6">
      <div className="grid gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Masuk</h1>
        <p className="text-muted-foreground text-sm">
          Masuk untuk memesan ruangan dan melihat status pemesananmu.
        </p>
      </div>

      <FormLogin
        roleDiharapkan="member"
        next={typeof next === 'string' ? next : undefined}
        tautanDaftar="/register"
      />

      <p className="text-muted-foreground border-t pt-4 text-center text-sm">
        Pengelola coworking space?{' '}
        <a href="/admin/login" className="text-primary font-medium hover:underline">
          Masuk sebagai pengelola
        </a>
      </p>
    </div>
  );
}
