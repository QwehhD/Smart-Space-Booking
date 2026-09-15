import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Menandai endpoint yang boleh diakses tanpa bearer token.
 *
 * JwtAuthGuard dipasang global supaya endpoint baru aman secara bawaan: lupa
 * memasang guard berarti endpoint tertutup, bukan terbuka.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
