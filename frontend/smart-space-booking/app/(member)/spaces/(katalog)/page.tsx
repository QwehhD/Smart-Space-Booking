import { Store } from 'lucide-react';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SpaceCard } from '@/components/member/space-card';
import { SpaceFilter } from '@/components/member/space-filter';
import { EmptyState } from '@/components/shared/empty-state';
import { daftarSpace } from '@/lib/api/spaces';
import { ApiError } from '@/lib/api/error';
import { URUTAN_TIPE } from '@/lib/constants';
import type { SpacePublik, TipeSpace } from '@/types/entities';

export const metadata = { title: 'Ketersediaan Space' };

/**
 * Katalog dirender di server.
 *
 * Halaman ini sengaja Server Component: hasilnya dapat dibaca tanpa menunggu
 * JavaScript, dapat ditautkan beserta filternya, dan menjadi bagian aplikasi yang
 * benar-benar memakai server-side rendering sesuai kategori Fullstack pada soal.
 * Tidak perlu login, sehingga pengunjung dapat menelusuri sebelum mendaftar.
 */
export const dynamic = 'force-dynamic';

function bacaTipe(nilai: string | string[] | undefined): TipeSpace | undefined {
  return typeof nilai === 'string' && (URUTAN_TIPE as string[]).includes(nilai)
    ? (nilai as TipeSpace)
    : undefined;
}

export default async function KatalogPage({
  searchParams,
}: PageProps<'/spaces'>) {
  const { search, tipe } = await searchParams;

  const kataKunci = typeof search === 'string' ? search.trim() : '';
  const tipeTerpilih = bacaTipe(tipe);

  let spaces: SpacePublik[] = [];
  let gagal: string | null = null;

  try {
    spaces = await daftarSpace({
      ...(tipeTerpilih ? { tipe: tipeTerpilih } : {}),
      ...(kataKunci ? { search: kataKunci } : {}),
    });
  } catch (error) {
    // Katalog tetap ditampilkan sebagai halaman utuh meski backend sedang mati,
    // supaya pengunjung melihat penjelasan alih-alih layar kosong.
    gagal =
      error instanceof ApiError
        ? error.message
        : 'Gagal memuat katalog space.';
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Ketersediaan Space"
        keterangan="Cari meja kerja atau ruang rapat, lalu pesan per jam."
      />

      <Suspense fallback={<div className="h-24" />}>
        <SpaceFilter
          searchAwal={kataKunci}
          tipeAwal={tipeTerpilih ?? 'semua'}
        />
      </Suspense>

      {gagal ? (
        <EmptyState
          judul="Gagal memuat katalog"
          keterangan={gagal}
          className="mt-2"
        />
      ) : spaces.length === 0 ? (
        <EmptyState
          icon={<Store className="size-8" />}
          judul="Space tidak ditemukan"
          keterangan={
            kataKunci || tipeTerpilih
              ? 'Coba ubah kata kunci atau pilih tipe yang lain.'
              : 'Belum ada space yang tersedia saat ini.'
          }
          className="mt-2"
        />
      ) : (
        <>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {spaces.length} space tersedia
          </p>
          <div className="masuk-berurut grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
