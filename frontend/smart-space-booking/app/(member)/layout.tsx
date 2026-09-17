import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LewatiKeKonten } from '@/components/layout/lewati-ke-konten';
import { MemberNav } from '@/components/layout/member-nav';

/**
 * Bingkai halaman member.
 *
 * Di desktop navigasinya di atas, di mobile pindah ke bawah mengikuti wireframe.
 * Ruang bawah disisakan agar isi halaman tidak tertutup bottom nav.
 */
export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <LewatiKeKonten />
      <MemberNav />

      <main
        id="konten-utama"
        className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10"
      >
        {children}
      </main>

      <BottomNav varian="member" />
    </div>
  );
}
