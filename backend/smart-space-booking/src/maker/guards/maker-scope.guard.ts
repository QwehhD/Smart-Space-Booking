import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithMakerAccount } from '../interfaces/request-with-maker-account.interface';
import { MAKER_KEY_HEADERS } from '../maker.constant';
import { MakerService } from '../maker.service';
import { MakerAuthGuard } from './maker-auth.guard';

/**
 * Menentukan tenant untuk endpoint yang menurut soal menerima dua cara sekaligus,
 * yaitu `Authorization: Bearer <token_app_maker>` atau header `x-maker-key`.
 *
 * Token diperiksa lebih dulu karena lebih spesifik: bila siswa sudah login,
 * statistik yang dilihat harus miliknya sendiri, bukan milik app key yang mungkin
 * masih tertinggal di konfigurasi frontend.
 */
@Injectable()
export class MakerScopeGuard implements CanActivate {
  constructor(
    private readonly makerService: MakerService,
    private readonly makerAuthGuard: MakerAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithMakerAccount>();

    if (request.headers.authorization) {
      const akun = await this.makerAuthGuard.autentikasi(request);
      request.makerAccount = akun;
      request.maker = { id: akun.id, app_key: akun.app_key };
      return true;
    }

    request.maker = await this.makerService.resolveByAppKey(
      this.ambilAppKey(request),
    );

    return true;
  }

  private ambilAppKey(request: RequestWithMakerAccount): string | undefined {
    for (const header of MAKER_KEY_HEADERS) {
      const nilai = request.headers[header];
      const appKey = Array.isArray(nilai) ? nilai[0] : nilai;

      if (appKey?.trim()) {
        return appKey.trim();
      }
    }

    return undefined;
  }
}
