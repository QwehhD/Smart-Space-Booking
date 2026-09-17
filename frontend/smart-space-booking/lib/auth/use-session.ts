'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useSyncExternalStore } from 'react';
import { ambilProfil } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/error';
import { bacaRole, hapusSesi, sedangLogin } from '@/lib/auth/session';
import { HALAMAN_LOGIN } from '@/lib/constants';
import { qk } from '@/lib/query-keys';
import type { Role } from '@/types/entities';

/**
 * Cookie tidak memancarkan peristiwa perubahan, dan sesi hanya berubah lewat
 * login atau logout yang keduanya diikuti navigasi, sehingga tidak ada yang
 * perlu dilanggan.
 */
const langgananKosong = () => () => {};

/**
 * Data pengguna yang sedang login.
 *
 * Cookie hanya menyimpan token dan role; nama, foto, dan nama coworking diambil
 * dari `GET /api/auth/profile` supaya selalu mengikuti data terbaru dan tidak
 * pernah basi karena tersimpan di peramban.
 */
export function useSesi() {
  // Cookie adalah sumber di luar React, jadi dibaca lewat useSyncExternalStore.
  // Snapshot untuk server sengaja mengembalikan nilai kosong, sehingga render
  // pertama di server dan di klien sama dan hidrasinya tidak bentrok.
  const punyaToken = useSyncExternalStore(
    langgananKosong,
    () => sedangLogin(),
    () => false,
  );

  const roleCookie = useSyncExternalStore(
    langgananKosong,
    () => bacaRole(),
    () => undefined,
  );

  const query = useQuery({
    queryKey: qk.profil,
    queryFn: () => ambilProfil(),
    enabled: punyaToken,
    staleTime: 5 * 60 * 1000,
  });

  const profil = query.data;

  return {
    profil,
    role: (profil?.role ?? roleCookie) as Role | undefined,
    sudahLogin: punyaToken,
    memuat: punyaToken && query.isLoading,
    error: query.error,
    /** Nama yang ditampilkan di navbar, berbeda sumbernya per role. */
    namaTampilan:
      profil?.member?.nama_member ?? profil?.space_owner?.nama_coworking ?? '',
    fotoUrl: profil?.member?.foto_url ?? profil?.space_owner?.foto_url ?? null,
  };
}

/**
 * Keluar dari aplikasi.
 *
 * Cache TanStack Query ikut dibersihkan, karena isinya milik pengguna
 * sebelumnya dan tidak boleh terlihat oleh siapa pun yang login berikutnya di
 * peramban yang sama.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(
    (role?: Role) => {
      const tujuan = HALAMAN_LOGIN[role ?? bacaRole() ?? 'member'];

      hapusSesi();
      queryClient.clear();
      router.replace(tujuan);
      router.refresh();
    },
    [queryClient, router],
  );
}

/**
 * Menangani sesi yang ditolak backend.
 *
 * Dipanggil dari penanganan error yang menerima ApiError; hanya bertindak untuk
 * 401 supaya kegagalan lain tidak ikut mengeluarkan pengguna.
 */
export function useTanganiSesiBerakhir() {
  const logout = useLogout();

  return useCallback(
    (error: unknown): boolean => {
      if (error instanceof ApiError && error.perluLoginUlang) {
        logout();
        return true;
      }

      return false;
    },
    [logout],
  );
}
