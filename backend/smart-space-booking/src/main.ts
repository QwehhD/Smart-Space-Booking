import { config as loadEnv } from 'dotenv';

// TZ harus di-set sebelum Node menginisialisasi objek Date pertama, sehingga
// .env dibaca lebih dulu di sini dan bukan menunggu ConfigModule.
loadEnv();
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './common/swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;
  const frontendUrl = config.get<string>('frontendUrl');

  app.use(
    helmet({
      // Gambar hasil upload harus bisa ditampilkan dari origin frontend.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.enableCors({
    origin: frontendUrl ? [frontendUrl] : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  setupSwagger(app);

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Server berjalan pada ${config.get<string>('appUrl')}`);
  logger.log(`Dokumentasi Swagger tersedia pada /docs`);
}

void bootstrap();
