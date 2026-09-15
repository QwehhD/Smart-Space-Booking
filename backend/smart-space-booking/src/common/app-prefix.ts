import { INestApplication } from '@nestjs/common';

/**
 * Memasang awalan `/api` untuk seluruh endpoint, kecuali status API dan health
 * check yang menurut soal berada di akar.
 *
 * Dipakai bersama oleh `main.ts`, skrip ekspor dokumentasi, dan pengujian e2e,
 * supaya path yang terdokumentasi dan yang diuji tidak pernah berbeda dari path
 * yang benar-benar dilayani.
 */
export const pasangGlobalPrefix = (app: INestApplication): void => {
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });
};
