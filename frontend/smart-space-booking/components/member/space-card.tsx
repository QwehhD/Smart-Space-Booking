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
    <article className="group bg-card flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <Link href={`/spaces/${space.id}`} className="block">
        <SpaceImage
          url={space.foto_url}
          nama={space.nama_space}
          className="aspect-[16/10] w-full"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="leading-snug font-medium">
              <Link
                href={`/spaces/${space.id}`}
                className="focus-visible:ring-ring rounded-sm group-hover:underline focus-visible:ring-2 focus-visible:outline-none"
              >
                {space.nama_space}
              </Link>
            </h3>
            <TipeBadge tipe={space.tipe} className="shrink-0" />
          </div>

          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Building2 className="size-3.5 shrink-0" />
            <span className="truncate">{space.owner.nama_coworking}</span>
          </p>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-sm">
          {space.deskripsi}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="grid gap-0.5">
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Users className="size-3.5" />
              {space.kapasitas} orang
            </p>
            <p className="text-sm">
              <Rupiah nilai={space.harga_per_jam} className="font-semibold" />
              <span className="text-muted-foreground"> / jam</span>
            </p>
          </div>

          <Button
            size="sm"
            render={
              <Link href={`/reservasi/baru?space=${space.id}`}>Pesan</Link>
            }
          />
        </div>
      </div>
    </article>
  );
}
