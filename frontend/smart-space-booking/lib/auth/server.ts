import { cookies } from 'next/headers';
import { COOKIE_ROLE, COOKIE_TOKEN } from '@/lib/constants';
import type { Role } from '@/types/entities';

/**
 * Pembacaan sesi dari Server Component.
 *
 * Fungsi klien tidak dapat dipakai di sini karena `document` tidak ada di server,
 * dan sebaliknya `cookies()` hanya tersedia di server.
 */
export async function sesiServer(): Promise<{
  token?: string;
  role?: Role;
}> {
  const store = await cookies();

  return {
    token: store.get(COOKIE_TOKEN)?.value,
    role: store.get(COOKIE_ROLE)?.value as Role | undefined,
  };
}
