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
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:hidden"
    >
      <ul className="flex items-stretch">
        {items.map((item) => {
          const aktif = menuAktif(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={aktif ? 'page' : undefined}
                className={cn(
                  'focus-visible:ring-ring flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium focus-visible:ring-2 focus-visible:outline-none',
                  aktif ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
