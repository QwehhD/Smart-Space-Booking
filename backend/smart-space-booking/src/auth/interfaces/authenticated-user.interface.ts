import { Role } from '@prisma/client';

/**
 * Pengguna yang sudah terautentikasi, sebagaimana ditempelkan JwtStrategy ke
 * `request.user`. Sengaja tanpa `password`, dan menyertakan id profil supaya
 * service tidak perlu query ulang hanya untuk tahu member atau owner mana.
 */
export interface AuthenticatedUser {
  id: number;
  username: string;
  role: Role;
  member_id?: number;
  owner_id?: number;
}
