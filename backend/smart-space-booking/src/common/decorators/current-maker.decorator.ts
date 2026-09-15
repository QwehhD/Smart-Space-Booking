import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { MakerContext } from '../../maker/interfaces/maker-context.interface';
import { RequestWithMaker } from '../interfaces/request-with-maker.interface';

/**
 * Mengambil tenant pemilik data yang sudah ditempelkan MakerContextGuard.
 *
 * Ketiadaan maker di sini berarti endpoint memakai decorator ini tapi lupa
 * melewati guard, jadi dilaporkan sebagai kesalahan server, bukan diam-diam
 * dianggap tidak bertenant yang justru berisiko mencampur data antar maker.
 */
export const CurrentMaker = createParamDecorator(
  (_data: unknown, context: ExecutionContext): MakerContext => {
    const request = context.switchToHttp().getRequest<RequestWithMaker>();

    if (!request.maker) {
      throw new InternalServerErrorException(
        'Konteks App Maker belum tersedia pada request ini',
      );
    }

    return request.maker;
  },
);
