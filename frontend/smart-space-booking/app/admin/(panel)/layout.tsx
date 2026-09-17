import type { ReactNode } from 'react';
import { AdminSidebar, AdminTopbar } from '@/components/layout/admin-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';

/**
 * Bingkai panel pengelola.
 *
 * Sidebar tetap di desktop; di mobile isinya dipindah ke drawer pada bilah atas,
 * dengan empat menu tersering tetap terjangkau lewat bottom nav.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-6 md:pb-10">
          {children}
        </main>

        <BottomNav varian="admin" />
      </div>
    </div>
  );
}
