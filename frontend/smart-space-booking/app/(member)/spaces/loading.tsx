import { Skeleton } from '@/components/ui/skeleton';

/** Kerangka katalog selama data diambil di server. */
export default function KatalogLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-3">
        <Skeleton className="h-9 w-full" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-28 shrink-0" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden rounded-lg border">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="grid gap-2 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
