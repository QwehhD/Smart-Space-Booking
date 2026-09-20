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
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 transition-colors">
      <div className="mx-auto flex h-15 w-full max-w-5xl items-center gap-6 px-4">
        <Link
          href="/spaces"
          aria-label="Smart Space Booking, ke katalog"
          className="focus-visible:ring-ring shrink-0 rounded-xl focus-visible:ring-2 focus-visible:outline-none transition-transform hover:scale-102"
        >
          <Merek />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 backdrop-blur-md">
            {NAV_MEMBER.map((item) => {
              const aktif = menuAktif(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={aktif ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      aktif
                        ? 'bg-background text-primary shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/40',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <PilihTema />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
