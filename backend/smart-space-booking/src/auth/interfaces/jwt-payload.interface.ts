import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  username: string;
  role: Role;
  member_id?: number;
  owner_id?: number;
}
