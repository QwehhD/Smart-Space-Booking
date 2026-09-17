import { Skeleton } from '@/components/ui/skeleton';

/**
 * Kerangka panel pengelola selama data diambil di server.
 *
 * Dipasang di tingkat grup, bukan per halaman, karena kedelapan halaman panel
 * berbentuk sama: judul, sebaris kendali, lalu daftar. Tidak ada satu pun di
 * antaranya yang memanggil `notFound()`, sehingga menyalakan streaming di sini
 * tidak mengubah kode status halaman mana pun (bandingkan keputusan 51).
 */
export default function PanelLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="ml-auto h-9 w-36" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="mt-1 h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
