'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Merek } from '@/components/layout/merek';
import { PilihTema } from '@/components/layout/pilih-tema';
import { menuAktif, NAV_MEMBER } from '@/components/layout/nav-items';
import { UserMenu } from '@/components/layout/user-menu';
import { cn } from '@/lib/utils';

/** Navigasi atas untuk layar sedang ke atas. Di mobile digantikan bottom nav. */
export function MemberNav() {
  const pathname = usePathname();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4">
        <Link
          href="/spaces"
          aria-label="Smart Space Booking, ke katalog"
          className="focus-visible:ring-ring shrink-0 rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <Merek />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_MEMBER.map((item) => {
              const aktif = menuAktif(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={aktif ? 'page' : undefined}
                    className={cn(
                      'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                      aktif
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <PilihTema />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
