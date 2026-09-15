import { config as loadEnv } from 'dotenv';

// TZ harus di-set sebelum Node menginisialisasi objek Date pertama, sehingga
// .env dibaca lebih dulu di sini dan bukan menunggu ConfigModule.
loadEnv();
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;

  await app.listen(port);
}

void bootstrap();
