import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  maker_id: number;
  member_id?: number;
  owner_id?: number;
  /**
   * Hanya terisi pada token akun maker. Dideklarasikan di sini supaya JwtStrategy
   * dapat menolak token maker tanpa memakai type assertion.
   */
  type?: string;
}
