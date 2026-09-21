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
  foto: KonfigurasiFoto;
}

/**
 * Tempat foto disimpan.
 *
 * `baseUrl` adalah awalan URL publik yang tinggal disambung `/<folder>/<nama>`.
 * Bentuknya sengaja sama untuk kedua penyimpanan, sehingga kolom `foto` di
 * database tetap cukup berisi nama berkas dan tidak perlu diubah saat pindah.
 */
export type KonfigurasiFoto =
  | { penyimpanan: 'lokal'; baseUrl: string }
  | {
      penyimpanan: 'cloudinary';
      baseUrl: string;
      cloudinary: KredensialCloudinary;
    };

export interface KredensialCloudinary {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  /** Folder induk di Cloudinary, agar foto project ini tidak bercampur. */
  folder: string;
}

/**
 * `CLOUDINARY_URL` berbentuk `cloudinary://<api_key>:<api_secret>@<cloud_name>`,
 * format yang disalin langsung dari dasbor Cloudinary.
 */
export const bacaCloudinaryUrl = (
  url: string,
  folder: string,
): KredensialCloudinary => {
  const u = new URL(url);

  return {
    cloudName: u.hostname,
    apiKey: decodeURIComponent(u.username),
    apiSecret: decodeURIComponent(u.password),
    folder,
  };
};

export const konfigurasiFoto = (
  env: NodeJS.ProcessEnv,
  appUrl: string,
): KonfigurasiFoto => {
  if (!env.CLOUDINARY_URL) {
    return { penyimpanan: 'lokal', baseUrl: `${appUrl}/uploads` };
  }

  const cloudinary = bacaCloudinaryUrl(
    env.CLOUDINARY_URL,
    env.CLOUDINARY_FOLDER || 'smart-space-booking',
  );

  return {
    penyimpanan: 'cloudinary',
    // f_auto,q_auto membuat Cloudinary mengirim format dan kualitas yang paling
    // hemat untuk peramban peminta, tanpa mengubah berkas aslinya.
    baseUrl: `https://res.cloudinary.com/${cloudinary.cloudName}/image/upload/f_auto,q_auto/${cloudinary.folder}`,
    cloudinary,
  };
};

export const configuration = (): AppConfig => {
  const maxSizeMb = Number(process.env.UPLOAD_MAX_SIZE_MB ?? 2);
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    appUrl,
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
    foto: konfigurasiFoto(process.env, appUrl),
  };
};
