import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { MakerService } from '../maker.service';
import {
  MAKER_TOKEN_TYPE,
  MakerJwtPayload,
} from '../interfaces/maker-jwt-payload.interface';
import { RequestWithMakerAccount } from '../interfaces/request-with-maker-account.interface';

const TOKEN_TIDAK_VALID = 'Token App Maker tidak valid atau sudah kedaluwarsa!';

/**
 * Mengautentikasi akun siswa dari `Authorization: Bearer <token>`.
 *
 * Token member dan admin space ditandatangani dengan secret yang sama, sehingga
 * guard ini mewajibkan penanda `type: 'maker'` agar token user tidak dapat
 * dipakai membaca app key milik siswa.
 */
@Injectable()
export class MakerAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly makerService: MakerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithMakerAccount>();

    request.makerAccount = await this.autentikasi(request);
    return true;
  }

  /** Mengambil akun maker dari token, atau melempar 401 bila tidak sah. */
  async autentikasi(request: Request) {
    const token = this.ambilBearerToken(request);

    if (!token) {
      throw new UnauthorizedException(TOKEN_TIDAK_VALID);
    }

    let payload: MakerJwtPayload;

    try {
      payload = await this.jwt.verifyAsync<MakerJwtPayload>(token);
    } catch {
      throw new UnauthorizedException(TOKEN_TIDAK_VALID);
    }

    if (payload.type !== MAKER_TOKEN_TYPE) {
      throw new UnauthorizedException(TOKEN_TIDAK_VALID);
    }

    // Akun dibaca ulang dari database supaya token milik akun yang sudah dihapus
    // tidak lagi diterima sampai masa berlakunya habis.
    const maker = await this.makerService.cariAkunById(payload.sub);

    if (!maker) {
      throw new UnauthorizedException(TOKEN_TIDAK_VALID);
    }

    return maker;
  }

  private ambilBearerToken(request: Request): string | undefined {
    const [skema, token] = request.headers.authorization?.split(' ') ?? [];
    return skema?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
