import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { MakerAccount } from '../interfaces/maker-account.interface';
import { RequestWithMakerAccount } from '../interfaces/request-with-maker-account.interface';

/** Mengambil akun siswa yang sudah diautentikasi MakerAuthGuard. */
export const CurrentMakerAccount = createParamDecorator(
  (_data: unknown, context: ExecutionContext): MakerAccount => {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithMakerAccount>();

    if (!request.makerAccount) {
      throw new InternalServerErrorException(
        'Akun App Maker belum diautentikasi pada request ini',
      );
    }

    return request.makerAccount;
  },
);
