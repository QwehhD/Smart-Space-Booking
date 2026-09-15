import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getApiInfo() {
    const appUrl = this.config.get<string>('appUrl');

    return {
      name: 'Coworking Space Backend API - UKK RPL Paket B',
      version: '1.0.0',
      status: 'online',
      swagger_docs: '/docs',
      description:
        'Backend service sistem reservasi coworking space: katalog space, kode promo, reservasi, e-ticket, check-in/check-out, dan rekapitulasi pendapatan.',
      documentation_links: {
        swagger: `${appUrl}/docs`,
        swagger_json: `${appUrl}/docs-json`,
      },
    };
  }

  async getHealth() {
    const databaseConnected = await this.prisma.isHealthy();

    if (!databaseConnected) {
      throw new ServiceUnavailableException(
        'Koneksi ke database gagal, silakan periksa konfigurasi DATABASE_URL',
      );
    }

    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
