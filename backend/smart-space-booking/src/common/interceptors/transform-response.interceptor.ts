import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DEFAULT_SUCCESS_MESSAGE } from '../constants/response.constant';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
import { ResponseDenganPesan } from '../responses/pesan-dinamis';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const messageDekorator =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_SUCCESS_MESSAGE;

    return next.handle().pipe(
      map((hasil) => {
        // Service boleh membungkus hasilnya untuk menentukan pesannya sendiri,
        // yang dibutuhkan endpoint dengan pesan bergantung nilai.
        const dinamis = hasil instanceof ResponseDenganPesan;

        return {
          status: true as const,
          statusCode: response.statusCode,
          message: dinamis ? hasil.pesan : messageDekorator,
          data: ((dinamis ? hasil.data : hasil) ?? {}) as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
