import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { STATUS_CODES } from 'http';
import {
  DEFAULT_ERROR_MESSAGE,
  PRISMA_ERROR_MESSAGE,
} from '../constants/response.constant';
import {
  ApiErrorResponse,
  ValidationErrorDetail,
} from '../interfaces/api-response.interface';

interface NormalizedError {
  statusCode: number;
  message: string;
  errors?: ValidationErrorDetail[];
}

const SERVER_ERROR_THRESHOLD: number = HttpStatus.INTERNAL_SERVER_ERROR;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const normalized = this.normalize(exception);

    if (normalized.statusCode >= SERVER_ERROR_THRESHOLD) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ApiErrorResponse = {
      status: false,
      statusCode: normalized.statusCode,
      message: normalized.message,
      error: STATUS_CODES[normalized.statusCode] ?? 'Error',
      timestamp: new Date().toISOString(),
    };

    if (normalized.errors?.length) {
      body.errors = normalized.errors;
    }

    response.status(normalized.statusCode).json(body);
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaException(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Data yang dikirim tidak sesuai dengan struktur database',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: DEFAULT_ERROR_MESSAGE,
    };
  }

  private fromHttpException(exception: HttpException): NormalizedError {
    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return { statusCode, message: payload };
    }

    const body = payload as {
      message?: string | string[];
      errors?: ValidationErrorDetail[];
    };
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : (body.message ?? exception.message);

    return { statusCode, message, errors: body.errors };
  }

  private fromPrismaException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): NormalizedError {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: PRISMA_ERROR_MESSAGE.P2002,
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: PRISMA_ERROR_MESSAGE.P2003,
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: PRISMA_ERROR_MESSAGE.P2025,
        };
      default:
        this.logger.error(
          `Prisma error ${exception.code}: ${exception.message}`,
        );
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: DEFAULT_ERROR_MESSAGE,
        };
    }
  }
}
