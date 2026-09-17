import type { Route } from 'next';
import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  type LucideIcon,
  Percent,
  QrCode,
  Store,
  Ticket,
  User,
  Users,
} from 'lucide-react';

export interface ItemNav {
  href: Route;
  label: string;
  icon: LucideIcon;
}

/**
 * Isi navigasi member, mengikuti bottom navigation pada wireframe.
 *
 * Daftar yang sama dipakai navbar desktop dan bottom nav mobile, sehingga
 * urutannya tidak pernah berbeda antar ukuran layar.
 */
export const NAV_MEMBER: ItemNav[] = [
  { href: '/spaces', label: 'Beranda', icon: Store },
  { href: '/reservasi', label: 'Reservasi', icon: CalendarCheck },
  { href: '/tiket', label: 'Tiket', icon: Ticket },
  { href: '/akun', label: 'Akun', icon: User },
];

/** Isi navigasi panel pengelola. */
export const NAV_ADMIN: ItemNav[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reservasi', label: 'Reservasi', icon: CalendarCheck },
  { href: '/admin/check-in', label: 'Check-in', icon: QrCode },
  { href: '/admin/spaces', label: 'Space', icon: Store },
  { href: '/admin/diskon', label: 'Diskon', icon: Percent },
  { href: '/admin/members', label: 'Member', icon: Users },
  { href: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
  { href: '/admin/profil', label: 'Profil', icon: User },
];

/** Empat menu utama admin untuk bottom nav; sisanya lewat drawer. */
export const NAV_ADMIN_UTAMA = NAV_ADMIN.slice(0, 4);

/**
 * Menentukan menu yang sedang aktif.
 *
 * Kecocokan memakai awalan supaya halaman anak, misalnya detail reservasi, tetap
 * menyorot menu induknya. Beranda dikecualikan agar tidak ikut aktif di semua
 * halaman yang kebetulan berawalan sama.
 */
export function menuAktif(pathname: string, href: string): boolean {
  if (href === '/spaces') {
    return pathname === '/spaces' || pathname.startsWith('/spaces/');
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
