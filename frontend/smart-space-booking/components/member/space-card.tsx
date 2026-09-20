import { Building2, Users } from 'lucide-react';
import Link from 'next/link';
import { Rupiah } from '@/components/shared/rupiah';
import { SpaceImage } from '@/components/shared/space-image';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { Button } from '@/components/ui/button';
import type { SpacePublik } from '@/types/entities';

/**
 * Kartu space pada katalog.
 *
 * Seluruh kartu dapat diklik menuju detail, sedangkan tombol Pesan langsung
 * membuka form pemesanan untuk space tersebut. Keduanya tautan sungguhan agar
 * dapat dibuka di tab baru dan tetap berfungsi tanpa JavaScript.
 */
export function SpaceCard({ space }: { space: SpacePublik }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/75 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <Link href={`/spaces/${space.id}`} className="relative block overflow-hidden">
        <SpaceImage
          url={space.foto_url}
          nama={space.nama_space}
          className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 z-10">
          <TipeBadge tipe={space.tipe} className="shadow-md backdrop-blur-md" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/80 to-transparent"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="grid gap-1">
          <h3 className="text-base font-bold leading-snug">
            <Link
              href={`/spaces/${space.id}`}
              className="focus-visible:ring-ring rounded-sm transition-colors group-hover:text-primary focus-visible:ring-2 focus-visible:outline-none"
            >
              {space.nama_space}
            </Link>
          </h3>

          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Building2 className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{space.owner.nama_coworking}</span>
          </p>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {space.deskripsi}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-3.5">
          <div className="grid gap-0.5">
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <Users className="size-3.5 text-muted-foreground" />
              Kapasitas {space.kapasitas} orang
            </p>
            <p className="text-sm">
              <Rupiah
                nilai={space.harga_per_jam}
                className="text-base font-bold text-foreground"
              />
              <span className="text-muted-foreground text-xs font-normal"> / jam</span>
            </p>
          </div>

          <Button
            size="sm"
            className="font-semibold shadow-xs"
            render={
              <Link href={`/reservasi/baru?space=${space.id}`}>
                Pesan
              </Link>
            }
          />
        </div>
      </div>
    </article>
  );
}
