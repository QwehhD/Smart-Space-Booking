import { Skeleton } from '@/components/ui/skeleton';

/** Kerangka histori bulanan. Tidak ada rute anak, jadi aman diberi streaming. */
export default function HistoriLoading() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-56" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
