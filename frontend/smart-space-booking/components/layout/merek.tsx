import { cn } from '@/lib/utils';

/**
 * Lambang dan nama aplikasi.
 *
 * Bentuknya dibuat sendiri sebagai SVG, bukan memakai ikon dari pustaka, supaya
 * tidak tertukar dengan ikon lain yang juga dipakai di antarmuka. Gambarnya
 * berupa denah ruang sederhana: satu bidang besar dengan satu meja di dalamnya,
 * yang langsung membaca sebagai "ruang yang dipesan".
 */
export function Merek({
  className,
  tampilkanNama = true,
}: {
  className?: string;
  tampilkanNama?: boolean;
}) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="bg-primary text-primary-foreground shadow-xs grid size-7 shrink-0 place-items-center rounded-[0.5rem]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="size-[1.05rem]"
        >
          <rect
            x="3.25"
            y="4.25"
            width="17.5"
            height="15.5"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <rect x="7" y="10.5" width="10" height="2.6" rx="1.3" fill="currentColor" />
          <rect x="10.7" y="13.1" width="2.6" height="3.4" rx="1" fill="currentColor" />
        </svg>
      </span>

      {tampilkanNama ? (
        <span className="grid leading-none">
          <span className="text-[0.9rem] font-semibold tracking-tight">
            Smart Space
          </span>
          <span className="text-muted-foreground mt-0.5 text-[0.62rem] font-medium tracking-[0.14em] uppercase">
            Booking
          </span>
        </span>
      ) : null}
    </span>
  );
}
