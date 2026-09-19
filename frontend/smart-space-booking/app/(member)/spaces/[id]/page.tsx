import { ArrowLeft, Building2, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Rupiah } from '@/components/shared/rupiah';
import { SpaceImage } from '@/components/shared/space-image';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error';
import { detailSpace } from '@/lib/api/spaces';
import { sesiServer } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * Pengambilan data dibungkus `cache` agar `generateMetadata` dan komponen
 * halaman memakai hasil yang sama, sehingga backend hanya dipanggil sekali per
 * request.
 */
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

export async function generateMetadata({ params }: PageProps<'/spaces/[id]'>) {
  const { id } = await params;
  const space = await ambilSpace(Number(id));

  // Dipanggil juga di sini, bukan hanya di komponen halaman, supaya judul
  // dokumen tidak sempat terisi nama space yang tidak ada. Status 404 sendiri
  // ditentukan oleh ada tidaknya streaming pada rute ini, bukan oleh urutan
  // metadata; lihat keputusan 52 di docs/KEPUTUSAN.md.
  if (!space) {
    notFound();
  }

  return { title: space.nama_space };
}

/**
 * Detail space, juga dirender di server dan terbuka untuk pengunjung.
 *
 * Tombol pesan mengarah ke form pemesanan yang terproteksi. Pengunjung yang
 * belum masuk akan dialihkan proxy ke halaman login beserta alamat tujuannya,
 * sehingga setelah masuk ia kembali ke form yang sama. Label tombolnya
 * disesuaikan di server supaya maksudnya jelas sebelum diklik.
 */
export default async function DetailSpacePage({
  params,
}: PageProps<'/spaces/[id]'>) {
  const { id } = await params;
  const [space, { role }] = await Promise.all([
    ambilSpace(Number(id)),
    sesiServer(),
  ]);

  if (!space) {
    notFound();
  }

  const tautanPesan = `/reservasi/baru?space=${space.id}`;
  const bolehPesan = role !== 'admin_space';

  return (
    <div className="grid gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2"
        render={
          <Link href="/spaces">
            <ArrowLeft />
            Kembali ke katalog
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <SpaceImage
          url={space.foto_url}
          nama={space.nama_space}
          priority
          className="aspect-[16/10] w-full rounded-lg border"
        />

        <div className="grid gap-5">
          <div className="grid gap-2">
            <TipeBadge tipe={space.tipe} className="w-fit" />
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {space.nama_space}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Building2 className="size-4 shrink-0" />
              {space.owner.nama_coworking}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">Harga sewa</dt>
              <dd className="mt-0.5 font-semibold">
                <Rupiah nilai={space.harga_per_jam} />
                <span className="text-muted-foreground font-normal"> / jam</span>
              </dd>
            </div>
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground text-xs">Kapasitas</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-semibold">
                <Users className="size-4" />
                {space.kapasitas} orang
              </dd>
            </div>
          </dl>

          {bolehPesan ? (
            <Button size="lg" render={<Link href={tautanPesan}>Pesan Sekarang</Link>} />
          ) : (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
              Kamu sedang masuk sebagai pengelola. Pemesanan hanya dapat dilakukan
              dari akun member.
            </p>
          )}
        </div>
      </div>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Fasilitas</h2>
        <p className="text-muted-foreground max-w-prose leading-relaxed whitespace-pre-line">
          {space.deskripsi}
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Pengelola</h2>
        <div className="grid gap-1.5 rounded-lg border p-4">
          <p className="font-medium">{space.owner.nama_coworking}</p>
          <p className="text-muted-foreground text-sm">
            {space.owner.nama_pemilik}
          </p>
          <p className="flex items-center gap-1.5 text-sm">
            <Phone className="text-muted-foreground size-3.5" />
            <a href={`tel:${space.owner.telp}`} className="hover:underline">
              {space.owner.telp}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
