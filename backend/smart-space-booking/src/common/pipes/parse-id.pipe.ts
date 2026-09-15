import { BadRequestException, ParseIntPipe } from '@nestjs/common';

/**
 * Mengubah path parameter id menjadi angka, dengan pesan Bahasa Indonesia.
 *
 * ParseIntPipe bawaan membalas "Validation failed (numeric string is expected)",
 * yang berbahasa Inggris dan menyebut istilah internal, padahal pesan ini sampai
 * ke pemakai seperti error lainnya.
 */
export class ParseIdPipe extends ParseIntPipe {
  constructor() {
    super({
      exceptionFactory: () =>
        new BadRequestException('Parameter id harus berupa angka!'),
    });
  }
}
