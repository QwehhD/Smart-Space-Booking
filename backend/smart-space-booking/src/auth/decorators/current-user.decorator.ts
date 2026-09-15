import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Mengambil pengguna terautentikasi dari request.
 *
 * Ketiadaan pengguna berarti endpoint ini ditandai @Public() tapi tetap memakai
 * decorator ini, jadi dilaporkan sebagai kesalahan server ketimbang diteruskan
 * sebagai `undefined` yang akan meledak jauh dari sumber masalahnya.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();

    if (!request.user) {
      throw new InternalServerErrorException(
        'Pengguna belum diautentikasi pada request ini',
      );
    }

    return request.user;
  },
);
