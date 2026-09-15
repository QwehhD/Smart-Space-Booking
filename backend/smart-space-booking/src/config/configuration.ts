export interface AppConfig {
  nodeEnv: string;
  port: number;
  appUrl: string;
  frontendUrl: string;
  timezone: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  upload: {
    maxSizeMb: number;
    maxSizeBytes: number;
  };
  jamOperasional: {
    buka: string;
    tutup: string;
  };
  strictCheckinDate: boolean;
}

export const configuration = (): AppConfig => {
  const maxSizeMb = Number(process.env.UPLOAD_MAX_SIZE_MB ?? 2);

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    timezone: process.env.TZ ?? 'Asia/Jakarta',
    jwt: {
      secret: process.env.JWT_SECRET as string,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    },
    upload: {
      maxSizeMb,
      maxSizeBytes: maxSizeMb * 1024 * 1024,
    },
    jamOperasional: {
      buka: process.env.JAM_OPERASIONAL_BUKA ?? '07:00',
      tutup: process.env.JAM_OPERASIONAL_TUTUP ?? '22:00',
    },
    strictCheckinDate: String(process.env.STRICT_CHECKIN_DATE) === 'true',
  };
};
