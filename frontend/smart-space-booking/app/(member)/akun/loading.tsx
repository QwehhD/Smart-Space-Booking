import { Skeleton } from '@/components/ui/skeleton';

/** Kerangka halaman akun. Tidak ada rute anak, jadi aman diberi streaming. */
export default function AkunLoading() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid gap-4 rounded-lg border p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 shrink-0 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <div className="grid gap-2.5 border-t pt-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      <Skeleton className="h-9 w-full" />
    </div>
  );
}
