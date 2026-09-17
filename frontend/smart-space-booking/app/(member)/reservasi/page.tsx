import { History } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DaftarReservasi } from '@/components/member/daftar-reservasi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = { title: 'Status Pemesanan' };

export default function StatusPemesananPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Status Pemesanan"
        keterangan="Pantau status seluruh pemesananmu."
        aksi={
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href="/reservasi/histori">
                <History />
                Histori
              </Link>
            }
          />
        }
      />

      {/* Tab aktif dibaca dari URL, sehingga komponennya menunggu search params. */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <DaftarReservasi />
      </Suspense>
    </div>
  );
}
