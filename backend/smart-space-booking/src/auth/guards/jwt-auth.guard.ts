import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

/**
 * Guard autentikasi yang dipasang global, sehingga endpoint tertutup secara
 * bawaan dan hanya terbuka bila secara eksplisit ditandai @Public().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const publik = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return publik ? true : super.canActivate(context);
  }

  /**
   * Passport membalas "Unauthorized" dalam Bahasa Inggris untuk token yang hilang
   * atau rusak, berbeda dengan pesan endpoint lain. Pesannya diseragamkan di sini,
   * dan sengaja tidak membedakan token hilang, kedaluwarsa, atau palsu agar tidak
   * menjadi petunjuk bagi yang mencoba-coba.
   */
  handleRequest<TUser>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException(
        'Token tidak valid atau sudah kedaluwarsa!',
      );
    }

    return user;
  }
}
