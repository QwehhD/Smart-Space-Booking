'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  menuAktif,
  NAV_ADMIN_UTAMA,
  NAV_MEMBER,
} from '@/components/layout/nav-items';
import { cn } from '@/lib/utils';

/**
 * Navigasi bawah untuk layar kecil, mengikuti wireframe.
 *
 * Daftar menunya dipilih lewat `varian` dan diimpor di sini, bukan diterima
 * sebagai prop, karena setiap item memuat komponen ikon. Komponen adalah fungsi,
 * dan fungsi tidak dapat dilewatkan dari Server Component ke Client Component.
 *
 * Disembunyikan pada layar sedang ke atas, karena di sana navigasinya sudah
 * ditangani navbar atau sidebar.
 */
export function BottomNav({ varian }: { varian: 'member' | 'admin' }) {
  const pathname = usePathname();
  const items = varian === 'member' ? NAV_MEMBER : NAV_ADMIN_UTAMA;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 shadow-lg md:hidden"
    >
      <ul className="flex items-stretch justify-around px-2 py-1">
        {items.map((item) => {
          const aktif = menuAktif(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={aktif ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-1.5 text-[11px] font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  aktif ? 'text-primary scale-105 font-semibold' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {aktif && (
                  <span className="absolute top-0 h-0.5 w-6 rounded-full bg-primary shadow-xs shadow-primary" />
                )}
                <Icon className={cn('size-5 transition-transform duration-200', aktif && 'translate-y-0.5')} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
