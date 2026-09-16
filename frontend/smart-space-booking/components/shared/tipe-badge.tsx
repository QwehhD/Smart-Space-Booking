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
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      {LABEL_TIPE[tipe]}
    </span>
  );
}
