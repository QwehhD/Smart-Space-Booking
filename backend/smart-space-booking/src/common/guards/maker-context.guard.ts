import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_MAKER_CONTEXT_KEY } from '../decorators/skip-maker-context.decorator';
import { RequestWithMaker } from '../interfaces/request-with-maker.interface';
import { MAKER_KEY_HEADERS } from '../../maker/maker.constant';
import { MakerService } from '../../maker/maker.service';

/**
 * Menempelkan tenant pemilik data ke setiap request sebelum controller berjalan.
 *
 * Dibuat sebagai guard, bukan middleware, karena penolakan app key yang tidak
 * dikenal harus melewati exception filter global agar bentuk response errornya
 * sama dengan endpoint lain.
 */
@Injectable()
export class MakerContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly makerService: MakerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const dilewati = this.reflector.getAllAndOverride<boolean>(
      SKIP_MAKER_CONTEXT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (dilewati) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithMaker>();
    request.maker = await this.makerService.resolveByAppKey(
      this.ambilAppKey(request),
    );

    return true;
  }

  private ambilAppKey(request: RequestWithMaker): string | undefined {
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
