import { NextResponse, type NextRequest } from 'next/server';
import { BERANDA_ROLE, COOKIE_ROLE, COOKIE_TOKEN } from '@/lib/constants';
import type { Role } from '@/types/entities';

/**
 * Proteksi route sebelum halaman dirender.
 *
 * Di Next.js 16 konvensinya bernama `proxy`, menggantikan `middleware` yang sudah
 * deprecated; fungsinya sama.
 *
 * Pemeriksaan di sini hanya melihat ada tidaknya cookie sesi dan rolenya, bukan
 * memvalidasi tokennya. Keabsahan token tetap ditentukan backend pada setiap
 * request, dan sesi yang ditolak akan dibersihkan oleh penanganan 401 di klien.
 * Tujuan lapisan ini adalah mencegah halaman yang salah sempat tampil, bukan
 * menjadi satu-satunya penjaga.
 */

/** Halaman yang hanya masuk akal dibuka saat belum login. */
const RUTE_TAMU = ['/login', '/register', '/admin/login', '/admin/register'];

const RUTE_MEMBER = ['/reservasi', '/tiket', '/akun'];

const AWALAN_ADMIN = '/admin';

function rutenya(path: string, daftar: string[]): boolean {
  return daftar.some((awalan) => path === awalan || path.startsWith(`${awalan}/`));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_TOKEN)?.value;
  const role = request.cookies.get(COOKIE_ROLE)?.value as Role | undefined;
  const sudahLogin = Boolean(token && role);

  // Sudah login tetapi membuka halaman login atau register: langsung ke beranda
  // rolenya sendiri, supaya tidak ada dua sesi yang saling menimpa.
  if (rutenya(pathname, RUTE_TAMU)) {
    if (sudahLogin && role) {
      return NextResponse.redirect(new URL(BERANDA_ROLE[role], request.url));
    }

    return NextResponse.next();
  }

  const butuhAdmin = pathname.startsWith(AWALAN_ADMIN);
  const butuhMember = rutenya(pathname, RUTE_MEMBER);

  if (!butuhAdmin && !butuhMember) {
    return NextResponse.next();
  }

  if (!sudahLogin) {
    const tujuan = new URL(butuhAdmin ? '/admin/login' : '/login', request.url);
    // Alamat yang hendak dibuka disimpan agar pengguna kembali ke sana setelah login.
    tujuan.searchParams.set('next', `${pathname}${search}`);

    return NextResponse.redirect(tujuan);
  }

  const roleCocok = butuhAdmin ? role === 'admin_space' : role === 'member';

  if (!roleCocok && role) {
    return NextResponse.redirect(new URL(BERANDA_ROLE[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Berkas statis, gambar, dan favicon dilewati. Tanpa pengecualian ini, proxy
   * ikut berjalan untuk setiap aset dan dapat menghalangi CSS maupun gambar.
   */
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
