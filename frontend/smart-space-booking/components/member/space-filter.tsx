'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { TipeSpace } from '@/types/entities';

/**
 * Urutan tab mengikuti wireframe, yang menaruh Private Office sebelum Meeting
 * Room. Urutannya memang berbeda dari urutan enum di backend.
 */
const TAB: { nilai: TipeSpace | 'semua'; label: string }[] = [
  { nilai: 'semua', label: 'Semua' },
  { nilai: 'desk', label: 'Personal Desk' },
  { nilai: 'private_office', label: 'Private Office' },
  { nilai: 'meeting_room', label: 'Meeting Room' },
];

const JEDA_KETIK = 400;

/**
 * Pencarian dan penyaringan katalog.
 *
 * Nilainya disimpan di URL, bukan di state komponen, sehingga hasil pencarian
 * dapat ditautkan, disimpan sebagai bookmark, dan tetap bertahan saat halaman
 * dimuat ulang. Halaman katalognya sendiri tetap Server Component yang membaca
 * parameter itu.
 */
export function SpaceFilter({
  searchAwal,
  tipeAwal,
}: {
  searchAwal: string;
  tipeAwal: TipeSpace | 'semua';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [menunggu, mulaiTransisi] = useTransition();
  const [teks, setTeks] = useState(searchAwal);

  function ubahUrl(ubahan: Record<string, string | null>) {
    const baru = new URLSearchParams(params.toString());

    for (const [kunci, nilai] of Object.entries(ubahan)) {
      if (nilai) {
        baru.set(kunci, nilai);
      } else {
        baru.delete(kunci);
      }
    }

    const query = baru.toString();
    mulaiTransisi(() => router.replace(query ? `${pathname}?${query}` : pathname));
  }

  // Pencarian ditunda sejenak agar tidak mengirim satu request per ketikan.
  useEffect(() => {
    if (teks === searchAwal) {
      return;
    }

    const timer = setTimeout(() => ubahUrl({ search: teks.trim() || null }), JEDA_KETIK);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teks]);

  return (
    <div className="grid gap-4">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Cari nama space, coworking, atau fasilitas…"
          aria-label="Cari space"
          className="h-11 rounded-2xl border-border/75 bg-card/80 pl-10 pr-10 text-sm shadow-xs backdrop-blur-xs transition-all focus-visible:border-primary/50 focus-visible:ring-primary/20"
        />
        {teks ? (
          <button
            type="button"
            onClick={() => setTeks('')}
            aria-label="Hapus pencarian"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="Filter tipe space"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0"
      >
        {TAB.map((tab) => {
          const aktif = tipeAwal === tab.nilai;

          return (
            <Button
              key={tab.nilai}
              role="tab"
              aria-selected={aktif}
              size="sm"
              variant={aktif ? 'default' : 'outline'}
              className={cn(
                'rounded-full shrink-0 font-semibold text-xs tracking-tight transition-all',
                aktif && 'shadow-xs',
                menunggu && 'opacity-70',
              )}
              onClick={() =>
                ubahUrl({ tipe: tab.nilai === 'semua' ? null : tab.nilai })
              }
            >
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
