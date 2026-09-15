import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';

const TANPA_HAK_AKSES =
  'Anda tidak memiliki hak akses untuk melakukan tindakan ini!';

/**
 * Memeriksa role pengguna terhadap daftar role yang diizinkan endpoint.
 *
 * Dipasang global dan berjalan setelah JwtAuthGuard, sehingga cukup menambahkan
 * @Roles(...) pada endpoint tanpa perlu memasang @UseGuards di tiap controller.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roleDiizinkan = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roleDiizinkan?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    // Pengguna semestinya sudah ada karena JwtAuthGuard berjalan lebih dulu.
    // Ketiadaannya berarti endpoint ini keliru ditandai @Public() padahal
    // dibatasi role, dan lebih aman ditolak daripada diloloskan.
    if (!request.user || !roleDiizinkan.includes(request.user.role)) {
      throw new ForbiddenException(TANPA_HAK_AKSES);
    }

    return true;
  }
}
