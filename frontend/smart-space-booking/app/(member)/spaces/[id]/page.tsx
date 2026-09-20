import { ArrowLeft, ArrowRight, Building2, Phone, Users } from 'lucide-react';
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
    <div className="grid gap-8 masuk max-w-5xl mx-auto pb-12">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2 text-muted-foreground hover:text-foreground font-medium"
        render={
          <Link href="/spaces" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Kembali ke katalog
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2.2fr)] lg:items-start">
        {/* Gambar Galeri Utama */}
        <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-lg">
          <SpaceImage
            url={space.foto_url}
            nama={space.nama_space}
            priority
            className="aspect-[16/11] w-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
          <div className="absolute top-4 right-4 z-10">
            <TipeBadge tipe={space.tipe} className="shadow-lg backdrop-blur-md text-xs px-3 py-1" />
          </div>
        </div>

        {/* Panel Ringkasan & Booking */}
        <div className="flex flex-col gap-6 rounded-3xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-xs">
          <div className="grid gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance">
              {space.nama_space}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Building2 className="size-4 shrink-0 text-primary" />
              <span className="font-medium text-foreground">{space.owner.nama_coworking}</span>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3.5">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <dt className="text-muted-foreground text-xs font-medium">Tarif Sewa</dt>
              <dd className="mt-1">
                <Rupiah
                  nilai={space.harga_per_jam}
                  className="text-xl font-extrabold text-foreground"
                />
                <span className="text-muted-foreground text-xs font-normal"> / jam</span>
              </dd>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <dt className="text-muted-foreground text-xs font-medium">Kapasitas Maksimal</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-extrabold text-xl text-foreground">
                <Users className="size-5 text-primary" />
                <span>{space.kapasitas} <span className="text-xs font-normal text-muted-foreground">orang</span></span>
              </dd>
            </div>
          </dl>

          {bolehPesan ? (
            <Button
              size="lg"
              className="h-12 w-full text-base font-bold shadow-lg shadow-primary/25"
              render={
                <Link href={tautanPesan} className="flex items-center justify-center gap-2">
                  Pesan Sekarang
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 p-4 text-xs text-muted-foreground bg-muted/20">
              Kamu sedang masuk sebagai pengelola. Pemesanan hanya dapat dilakukan
              dari akun member.
            </div>
          )}
        </div>
      </div>

      {/* Deskripsi & Fasilitas */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xs grid gap-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Deskripsi & Fasilitas Ruang
        </h2>
        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base whitespace-pre-line text-pretty">
          {space.deskripsi}
        </p>
      </section>

      {/* Info Pengelola Coworking */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-2xs grid gap-3">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Informasi Pengelola
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="grid gap-1">
            <p className="font-bold text-base text-foreground">{space.owner.nama_coworking}</p>
            <p className="text-muted-foreground text-xs">
              Penanggung jawab: {space.owner.nama_pemilik}
            </p>
          </div>

          <a
            href={`tel:${space.owner.telp}`}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Phone className="size-3.5" />
            <span>Hubungi: {space.owner.telp}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
