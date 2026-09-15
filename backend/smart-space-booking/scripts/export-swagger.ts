import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { pasangGlobalPrefix } from '../src/common/app-prefix';
import { buildSwaggerDocument } from '../src/common/swagger/swagger.setup';
import { bangunKoleksiPostman } from './build-postman';

/**
 * Menulis dokumentasi kontrak API ke berkas, untuk dikumpulkan bersama source
 * code.
 *
 * Aplikasinya dibuat tanpa memanggil `listen`, sehingga skrip ini hanya
 * memerlukan modulnya dapat dimuat dan tidak menduduki port maupun menunggu
 * database siap.
 */
async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  pasangGlobalPrefix(app);
  await app.init();

  const dokumen = buildSwaggerDocument(app);
  const docs = join(process.cwd(), 'docs');

  tulisJson(join(docs, 'swagger.json'), dokumen);
  tulisJson(
    join(docs, 'postman_collection.json'),
    bangunKoleksiPostman(dokumen),
  );

  await app.close();
}

function tulisJson(tujuan: string, isi: unknown): void {
  writeFileSync(tujuan, `${JSON.stringify(isi, null, 2)}\n`);
  console.log(`Ditulis: ${tujuan}`);
}

main().catch((error: unknown) => {
  console.error('Gagal mengekspor dokumentasi:', error);
  process.exitCode = 1;
});
