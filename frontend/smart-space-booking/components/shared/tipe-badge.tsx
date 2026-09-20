import { Briefcase, Laptop, Users } from 'lucide-react';
import { LABEL_TIPE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { TipeSpace } from '@/types/entities';

const IKON_TIPE: Record<TipeSpace, typeof Users> = {
  desk: Laptop,
  private_office: Briefcase,
  meeting_room: Users,
};

const GAYA_TIPE: Record<TipeSpace, string> = {
  desk: 'bg-primary/10 text-primary border-primary/20',
  private_office: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  meeting_room: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

/** Label tipe space dengan ikon khusus dan gaya elegan. */
export function TipeBadge({
  tipe,
  className,
}: {
  tipe: TipeSpace;
  className?: string;
}) {
  const Ikon = IKON_TIPE[tipe] ?? Users;
  const gaya = GAYA_TIPE[tipe] ?? 'bg-muted/60 text-muted-foreground border-border';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium whitespace-nowrap shadow-2xs transition-colors',
        gaya,
        className,
      )}
    >
      <Ikon className="size-3 shrink-0" />
      {LABEL_TIPE[tipe]}
    </span>
  );
}
