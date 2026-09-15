import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const buildSwaggerDocument = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Smart Space Booking API')
    .setDescription(
      'REST API sistem reservasi coworking space untuk UKK RPL 2026/2027 Paket B. ' +
        'Mencakup autentikasi multi-role, katalog space, kode promo, reservasi, ' +
        'e-ticket ber-QR, check-in/check-out, serta rekapitulasi pendapatan bulanan.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Tempelkan access_token hasil login tanpa awalan "Bearer"',
      },
      'access-token',
    )
    .build();

  return SwaggerModule.createDocument(app, config);
};

export const setupSwagger = (app: INestApplication): void => {
  SwaggerModule.setup('docs', app, buildSwaggerDocument(app), {
    jsonDocumentUrl: 'docs-json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });
};
