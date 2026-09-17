import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { FormReservasi } from '@/components/member/form-reservasi';
import { Rupiah } from '@/components/shared/rupiah';
import { SpaceImage } from '@/components/shared/space-image';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error';
import { detailSpace } from '@/lib/api/spaces';
import { sesiServer } from '@/lib/auth/server';

export const metadata = { title: 'Pesan Space' };
export const dynamic = 'force-dynamic';

const ambilSpace = cache(async (id: number) => {
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  try {
    return await detailSpace(id);
  } catch (error) {
    if (error instanceof ApiError && error.tidakDitemukan) {
      return null;
    }

    throw error;
  }
});

/**
 * Form pemesanan untuk satu space.
 *
 * Ringkasan space diambil di server, sedangkan formnya sendiri berjalan di klien
 * karena harus memeriksa ketersediaan dan menghitung harga sambil diisi.
 */
export default async function ReservasiBaruPage({
  searchParams,
}: PageProps<'/reservasi/baru'>) {
  const { space: idSpace } = await searchParams;
  const { role } = await sesiServer();

  // Halaman ini sudah dilindungi proxy, tetapi pengelola yang membukanya tetap
  // perlu diarahkan: backend hanya menerima pemesanan dari akun member.
  if (role === 'admin_space') {
    redirect('/admin/dashboard');
  }

  const space = await ambilSpace(Number(idSpace));

  if (!space) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        render={
          <Link href={`/spaces/${space.id}`}>
            <ArrowLeft />
            Kembali ke detail space
          </Link>
        }
      />

      <PageHeader
        judul="Pesan Space"
        keterangan="Pilih jadwal, pakai promo bila ada, lalu konfirmasi."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <aside className="bg-card grid gap-3 rounded-lg border p-4 lg:sticky lg:top-20">
          <SpaceImage
            url={space.foto_url}
            nama={space.nama_space}
            className="aspect-[16/10] w-full rounded-md"
          />

          <div className="grid gap-1.5">
            <TipeBadge tipe={space.tipe} className="w-fit" />
            <h2 className="leading-snug font-medium">{space.nama_space}</h2>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Building2 className="size-3.5 shrink-0" />
              <span className="truncate">{space.owner.nama_coworking}</span>
            </p>
            <p className="text-sm">
              <Rupiah nilai={space.harga_per_jam} className="font-semibold" />
              <span className="text-muted-foreground"> / jam</span>
            </p>
          </div>
        </aside>

        <FormReservasi space={space} />
      </div>
    </div>
  );
}
