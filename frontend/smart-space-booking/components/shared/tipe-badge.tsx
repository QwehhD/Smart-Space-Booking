import { LABEL_TIPE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { TipeSpace } from '@/types/entities';

/** Label tipe space, selalu memakai nama yang ramah dibaca. */
export function TipeBadge({
  tipe,
  className,
}: {
  tipe: TipeSpace;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-muted/60 text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium whitespace-nowrap',
        className,
      )}
    >
      {LABEL_TIPE[tipe]}
    </span>
  );
}
