import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Halaman sementara.
 *
 * Akan diganti pengalihan sesuai role setelah lapisan sesi tersedia, sehingga
 * pengunjung langsung diarahkan ke katalog atau dashboard miliknya.
 */
export default function BerandaSementara() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <div className="grid gap-3">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          Smart Space Booking
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Reservasi coworking space
        </h1>
        <p className="text-muted-foreground">
          Fondasi antarmuka sudah terpasang. Halaman katalog, pemesanan, dan
          panel pengelola menyusul pada tahap berikutnya.
        </p>
      </div>

      {process.env.NODE_ENV !== 'production' ? (
        <Button
          variant="outline"
          className="w-fit"
          render={<Link href="/design-system">Lihat design system</Link>}
        />
      ) : null}
    </main>
  );
}
