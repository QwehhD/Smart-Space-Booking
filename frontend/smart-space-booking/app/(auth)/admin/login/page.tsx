import Link from 'next/link';
import { FormLogin } from '@/components/auth/form-login';

export const metadata = { title: 'Masuk Pengelola' };

export default async function LoginAdminPage({
  searchParams,
}: PageProps<'/admin/login'>) {
  const { next } = await searchParams;

  return (
    <div className="grid gap-6">
      <div className="flex rounded-full border border-border/75 bg-muted/40 p-1">
        <Link
          href="/login"
          className="flex-1 rounded-full py-1.5 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Member
        </Link>
        <span className="flex-1 rounded-full py-1.5 text-center text-xs font-bold bg-background text-primary shadow-xs">
          Pengelola
        </span>
      </div>

      <div className="grid gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Panel Pengelola Space
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Kelola ketersediaan ruangan, scanner check-in, dan voucher promo.
        </p>
      </div>

      <FormLogin
        roleDiharapkan="admin_space"
        next={typeof next === 'string' ? next : undefined}
        tautanDaftar="/admin/register"
      />

      <p className="text-muted-foreground border-t border-border/70 pt-4 text-center text-xs">
        Ingin memesan ruangan?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Masuk sebagai member
        </Link>
      </p>
    </div>
  );
}
