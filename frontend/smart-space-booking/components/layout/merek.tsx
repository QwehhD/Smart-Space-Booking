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
    <span className={cn('group flex items-center gap-2.5 select-none', className)}>
      <span className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-sm shadow-primary/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/40">
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="size-4.5 transition-transform duration-300 group-hover:scale-110"
        >
          <rect
            x="3.25"
            y="4.25"
            width="17.5"
            height="15.5"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <rect x="7" y="10.5" width="10" height="2.6" rx="1.3" fill="currentColor" />
          <rect x="10.7" y="13.1" width="2.6" height="3.4" rx="1" fill="currentColor" />
        </svg>
      </span>

      {tampilkanNama ? (
        <span className="grid leading-none">
          <span className="text-[0.92rem] font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
            Smart Space
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-[0.62rem] font-bold tracking-[0.16em] uppercase text-primary/80">
            <span>Booking</span>

            {/* Penanda hidup: satu titik yang berkeliling pada cincin tipis.
                Dipilih menggantikan kedipan, yang mudah terbaca sebagai sesuatu
                yang meminta ditindaklanjuti. */}
            <span aria-hidden className="relative inline-block size-2.5 shrink-0">
              {/* Cincin dibuat sangat tipis supaya terbaca sebagai lintasan,
                  bukan sebagai bingkai. */}
              <span className="border-primary/20 absolute inset-0 rounded-full border-[0.5px]" />

              {/* Titiknya kecil dan pusatnya tepat di atas garis lintasan; bila
                  menyembul keluar, bentuknya terbaca sebagai gagang pemutar
                  seperti pada indikator memuat. */}
              <span className="orbit absolute inset-0">
                <span className="bg-foreground absolute top-0 left-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
              </span>
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );
}
