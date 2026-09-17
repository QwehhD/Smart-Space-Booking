'use client';

import { COOKIE_ROLE, COOKIE_TOKEN } from '@/lib/constants';
import type { Role } from '@/types/entities';

/**
 * Sesi disimpan di cookie, bukan localStorage, supaya proxy dan Server Component
 * dapat membacanya sebelum halaman dirender. Tanpa itu, proteksi route hanya bisa
 * dilakukan setelah halaman sempat tampil.
 *
 * Konsekuensinya cookie ini tidak dapat `httpOnly`, karena diisi oleh kode
 * peramban setelah login dan dibaca lagi oleh klien axios. Lihat catatan
 * keamanannya di docs/KEPUTUSAN.md.
 */

interface IsiToken {
  exp?: number;
}

/** Membaca klaim `exp` dari JWT tanpa pustaka tambahan. */
function bacaKedaluwarsa(token: string): number | undefined {
  try {
    const bagian = token.split('.')[1];

    if (!bagian) {
      return undefined;
    }

    // JWT memakai base64url: karakternya berbeda dan tanpa padding.
    const base64 = bagian.replace(/-/g, '+').replace(/_/g, '/');
    const isi = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))) as IsiToken;

    return typeof isi.exp === 'number' ? isi.exp : undefined;
  } catch {
    return undefined;
  }
}

function pasangCookie(nama: string, nilai: string, umurDetik: number) {
  const aman = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${nama}=${encodeURIComponent(nilai)}; Path=/; Max-Age=${umurDetik}; SameSite=Lax${aman}`;
}

function hapusCookie(nama: string) {
  document.cookie = `${nama}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Menyimpan sesi. Masa berlaku cookie mengikuti klaim `exp` token, sehingga
 * cookie tidak pernah hidup lebih lama daripada tokennya sendiri.
 */
export function simpanSesi(token: string, role: Role): void {
  const exp = bacaKedaluwarsa(token);
  const sisaDetik = exp
    ? Math.max(0, exp - Math.floor(Date.now() / 1000))
    : 60 * 60 * 24;

  pasangCookie(COOKIE_TOKEN, token, sisaDetik);
  pasangCookie(COOKIE_ROLE, role, sisaDetik);
}

export function hapusSesi(): void {
  hapusCookie(COOKIE_TOKEN);
  hapusCookie(COOKIE_ROLE);
}

function bacaCookie(nama: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const cocok = document.cookie
    .split('; ')
    .find((bagian) => bagian.startsWith(`${nama}=`));

  return cocok ? decodeURIComponent(cocok.slice(nama.length + 1)) : undefined;
}

export const bacaToken = () => bacaCookie(COOKIE_TOKEN);

export const bacaRole = () => bacaCookie(COOKIE_ROLE) as Role | undefined;

export const sedangLogin = () => Boolean(bacaToken());
