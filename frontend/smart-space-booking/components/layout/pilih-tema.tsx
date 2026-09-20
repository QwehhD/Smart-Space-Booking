'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PILIHAN = [
  { nilai: 'light', label: 'Terang', Ikon: Sun },
  { nilai: 'dark', label: 'Gelap', Ikon: Moon },
  { nilai: 'system', label: 'Ikut sistem', Ikon: Monitor },
] as const;

/** Berlangganan kosong; nilainya hanya berbeda antara server dan klien. */
const langgananKosong = () => () => {};

/**
 * Pemilih tema: terang, gelap, atau mengikuti pengaturan sistem.
 *
 * Tema yang sedang aktif baru diketahui setelah komponen berjalan di peramban,
 * karena tersimpan di `localStorage`. Merendernya langsung akan menghasilkan
 * ikon yang berbeda antara server dan klien, dan React menolak itu sebagai
 * ketidakcocokan hidrasi. Karena itu sebelum terpasang yang ditampilkan adalah
 * bentuk tombol yang sama dengan ikon tetap, sehingga tata letaknya tidak
 * bergeser ketika ikon aslinya menyusul.
 */
export function PilihTema() {
  const { theme, setTheme } = useTheme();

  const terpasang = useSyncExternalStore(
    langgananKosong,
    () => true,
    () => false,
  );

  const aktif = PILIHAN.find((p) => p.nilai === theme) ?? PILIHAN[2];
  const Ikon = terpasang ? aktif.Ikon : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Tema: ${terpasang ? aktif.label : 'memuat'}`}
          >
            <Ikon />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {PILIHAN.map(({ nilai, label, Ikon: IkonPilihan }) => (
          <DropdownMenuItem
            key={nilai}
            onClick={() => setTheme(nilai)}
            className="gap-2.5"
          >
            <IkonPilihan className="size-4" />
            {label}
            {terpasang && theme === nilai ? (
              <span className="bg-primary ml-auto size-1.5 rounded-full" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
