'use client';

import { LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout, useSesi } from '@/lib/auth/use-session';
import { inisial } from '@/lib/format';

/**
 * Identitas pengguna beserta tombol keluar.
 *
 * Nama dan fotonya diambil dari profil, bukan dari cookie, sehingga selalu
 * mengikuti data terbaru di backend.
 */
export function UserMenu() {
  const { namaTampilan, fotoUrl, profil, role, sudahLogin } = useSesi();
  const logout = useLogout();

  // Katalog space terbuka untuk pengunjung yang belum masuk, sehingga navbar
  // tetap tampil dan yang ditawarkan adalah tombol masuk, bukan identitas kosong.
  if (!sudahLogin) {
    return (
      <Button
        size="sm"
        variant="outline"
        render={
          <Link href="/login">
            <LogIn />
            Masuk
          </Link>
        }
      />
    );
  }

  const nama = namaTampilan || profil?.username || 'Pengguna';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
            <Avatar className="size-7">
              {fotoUrl ? <AvatarImage src={fotoUrl} alt={nama} /> : null}
              <AvatarFallback className="text-xs">{inisial(nama)}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[12rem] truncate text-sm sm:inline">
              {nama}
            </span>
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="grid gap-0.5">
          <span className="truncate font-medium">{nama}</span>
          {profil?.username ? (
            <span className="text-muted-foreground text-xs font-normal">
              @{profil.username}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout(role)}>
          <LogOut />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
