import Link from 'next/link';
import { FormLogin } from '@/components/auth/form-login';

export const metadata = { title: 'Masuk' };

export default async function LoginMemberPage({
  searchParams,
}: PageProps<'/login'>) {
  // searchParams berupa Promise pada Next.js 16 dan harus ditunggu.
  const { next } = await searchParams;

  return (
    <div className="grid gap-6">
      <div className="flex rounded-full border border-border/75 bg-muted/40 p-1">
        <span className="flex-1 rounded-full py-1.5 text-center text-xs font-bold bg-background text-primary shadow-xs">
          Member
        </span>
        <Link
          href="/admin/login"
          className="flex-1 rounded-full py-1.5 text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Pengelola
        </Link>
      </div>

      <div className="grid gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Masuk ke Akun Member
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Akses riwayat pemesanan ruangan dan e-ticket QR milikmu.
        </p>
      </div>

      <FormLogin
        roleDiharapkan="member"
        next={typeof next === 'string' ? next : undefined}
        tautanDaftar="/register"
      />

      <p className="text-muted-foreground border-t border-border/70 pt-4 text-center text-xs">
        Pengelola coworking space?{' '}
        <Link href="/admin/login" className="text-primary font-bold hover:underline">
          Masuk sebagai pengelola
        </Link>
      </p>
    </div>
  );
}
