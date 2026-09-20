import type { ReactNode } from 'react';
import { AdminSidebar, AdminTopbar } from '@/components/layout/admin-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LewatiKeKonten } from '@/components/layout/lewati-ke-konten';

/**
 * Bingkai panel pengelola.
 *
 * Sidebar tetap di desktop; di mobile isinya dipindah ke drawer pada bilah atas,
 * dengan empat menu tersering tetap terjangkau lewat bottom nav.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh">
      <LewatiKeKonten />
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />

        <main
          id="konten-utama"
          className="mx-auto w-full max-w-6xl flex-1 overflow-x-clip px-4 pt-6 pb-24 md:px-6 md:pb-10"
        >
          {children}
        </main>

        <BottomNav varian="admin" />
      </div>
    </div>
  );
}
