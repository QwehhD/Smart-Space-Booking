import { Home, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Tidak punya akses' };

/**
 * Ditampilkan ketika backend menolak sebuah tindakan karena rolenya tidak
 * berhak. Perpindahan antar panel yang salah role sudah dicegah lebih dulu oleh
 * proxy, jadi halaman ini untuk penolakan yang datang dari backend.
 */
export default function TidakBerhakPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <ShieldX className="text-muted-foreground size-10" />
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tidak punya akses
        </h1>
        <p className="text-muted-foreground text-sm">
          Akun yang sedang kamu pakai tidak berhak membuka halaman ini.
        </p>
      </div>
      <Button
        variant="outline"
        render={
          <Link href="/">
            <Home />
            Kembali ke beranda
          </Link>
        }
      />
    </main>
  );
}
