'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
          className="text-primary shrink-0 font-mono text-xs tracking-widest uppercase"
        >
          Smart Space
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
                      'hover:bg-muted focus-visible:ring-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                      aktif ? 'bg-muted text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
