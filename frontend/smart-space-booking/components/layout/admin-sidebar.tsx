'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Merek } from '@/components/layout/merek';
import { menuAktif, NAV_ADMIN } from '@/components/layout/nav-items';
import { UserMenu } from '@/components/layout/user-menu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSesi } from '@/lib/auth/use-session';
import { cn } from '@/lib/utils';

function DaftarMenu({ onPilih }: { onPilih?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="grid gap-1">
      {NAV_ADMIN.map((item) => {
        const aktif = menuAktif(pathname, item.href);
        const Icon = item.icon;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onPilih}
              aria-current={aktif ? 'page' : undefined}
              className={cn(
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-ring relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                // Menu aktif diberi penanda garis di tepi kiri, bukan hanya
                // latar berbeda, supaya posisi saat ini tetap terbaca sekilas
                // pada daftar yang cukup panjang.
                aktif
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground before:bg-sidebar-primary before:absolute before:top-1/2 before:left-0 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Sidebar tetap di desktop; di mobile isinya dipindah ke drawer. */
export function AdminSidebar() {
  const { namaTampilan } = useSesi();

  return (
    <aside className="bg-sidebar hidden w-60 shrink-0 border-r md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Merek />
      </div>

      <p className="text-muted-foreground px-4 pt-3 text-[0.68rem] font-semibold tracking-[0.12em] uppercase">
        Panel Pengelola
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <DaftarMenu />
      </div>

      {namaTampilan ? (
        <div className="text-muted-foreground border-t px-4 py-3 text-xs">
          <span className="line-clamp-2">{namaTampilan}</span>
        </div>
      ) : null}
    </aside>
  );
}

/** Bilah atas khusus mobile: pembuka drawer dan menu pengguna. */
export function AdminTopbar() {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4 backdrop-blur md:hidden">
      <Sheet open={terbuka} onOpenChange={setTerbuka}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Buka menu">
              <Menu />
            </Button>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="h-14 justify-center border-b px-4">
            <SheetTitle className="flex items-center">
              <Merek />
              <span className="sr-only">Panel Pengelola</span>
            </SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <DaftarMenu onPilih={() => setTerbuka(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Merek />

      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
