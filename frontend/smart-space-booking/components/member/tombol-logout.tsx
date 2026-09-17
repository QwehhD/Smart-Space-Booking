'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/auth/use-session';

/** Tombol keluar pada halaman akun, di luar menu pengguna di navbar. */
export function TombolLogout() {
  const logout = useLogout();

  return (
    <Button variant="outline" onClick={() => logout('member')}>
      <LogOut />
      Keluar
    </Button>
  );
}
