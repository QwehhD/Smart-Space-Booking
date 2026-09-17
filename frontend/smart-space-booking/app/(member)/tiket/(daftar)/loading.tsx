import { Skeleton } from '@/components/ui/skeleton';

/**
 * Kerangka daftar tiket.
 *
 * Diletakkan di dalam grup rute `(daftar)`, bukan langsung di `tiket/`, supaya
 * streaming-nya hanya berlaku untuk daftar ini dan tidak merembet ke
 * `tiket/[id]` yang memanggil `notFound()` (lihat keputusan 51).
 */
export default function TiketLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid gap-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-5 w-24 shrink-0" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
