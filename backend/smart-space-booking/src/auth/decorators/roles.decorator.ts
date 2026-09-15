import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Membatasi endpoint pada role tertentu, misalnya `@Roles(Role.admin_space)`.
 *
 * Endpoint tanpa decorator ini terbuka untuk semua pengguna yang sudah login,
 * karena pembatasan role adalah lapisan di atas autentikasi, bukan penggantinya.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
