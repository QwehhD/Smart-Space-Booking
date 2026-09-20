'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Merek } from '@/components/layout/merek';
import { PilihTema } from '@/components/layout/pilih-tema';
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
                'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                aktif
                  ? 'bg-primary/10 text-primary font-semibold shadow-2xs before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:translate-x-0.5',
              )}
            >
              <Icon className={cn('size-4 shrink-0 transition-colors', aktif ? 'text-primary' : 'text-muted-foreground')} />
              <span>{item.label}</span>
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
    <aside className="bg-sidebar hidden w-64 shrink-0 border-r border-border/70 md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-border/70 px-5">
        <Merek />
      </div>

      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <p className="text-muted-foreground text-[0.68rem] font-bold tracking-[0.14em] uppercase">
          Panel Pengelola
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
          Aktif
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <DaftarMenu />
      </div>

      <div className="flex items-center gap-2 border-t border-border/70 px-4 py-3 bg-muted/20">
        {namaTampilan ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">
              {namaTampilan}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Administrator
            </p>
          </div>
        ) : (
          <span className="flex-1" />
        )}
        <PilihTema />
      </div>
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

      <div className="ml-auto flex items-center gap-1">
        <PilihTema />
        <UserMenu />
      </div>
    </header>
  );
}
