import { Skeleton } from '@/components/ui/skeleton';

export default function DetailSpaceLoading() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-8 w-40" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Skeleton className="aspect-[16/10] w-full rounded-lg" />

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      <div className="grid gap-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
