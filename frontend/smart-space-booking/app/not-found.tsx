import { Home, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Halaman tidak ditemukan' };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <SearchX className="text-muted-foreground size-10" />
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Halaman tidak ditemukan
        </h1>
        <p className="text-muted-foreground text-sm">
          Alamat yang kamu buka tidak ada, atau datanya sudah dihapus.
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
