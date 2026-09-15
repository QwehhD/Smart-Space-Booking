import { SetMetadata } from '@nestjs/common';

export const SKIP_MAKER_CONTEXT_KEY = 'skipMakerContext';

/**
 * Menandai endpoint yang berada di luar mekanisme multi-tenancy, yaitu endpoint
 * yang tidak menyentuh data milik maker sama sekali: status API, health check,
 * dan pengelolaan akun maker itu sendiri.
 */
export const SkipMakerContext = () => SetMetadata(SKIP_MAKER_CONTEXT_KEY, true);
