import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadFolder } from '../common/utils/foto.util';
import {
  EKSTENSI_MIMETYPE,
  JENIS_DIIZINKAN,
  PESAN_UPLOAD,
} from './upload.constant';

/** Akar penyimpanan berkas, sama dengan folder yang disajikan statis di main.ts. */
const AKAR_UPLOAD = join(process.cwd(), 'uploads');

/**
 * Nama berkas dibuat dari waktu dan angka acak, mengikuti contoh pada soal
 * (`1787799592972-544446318.jpeg`). Nama asli kiriman tidak pernah dipakai agar
 * tidak ada berkas yang saling menimpa dan tidak ada nama yang dapat keluar dari
 * folder tujuan.
 */
function namaBerkasBaru(mimetype: string): string {
  const acak = Math.round(Math.random() * 1e9);
  return `${Date.now()}-${acak}${EKSTENSI_MIMETYPE[mimetype] ?? ''}`;
}

/**
 * Opsi multer untuk satu folder tujuan. Batas ukuran tidak diatur di sini
 * melainkan di MulterModule, supaya nilainya tetap berasal dari ConfigService.
 */
export function opsiUpload(folder: UploadFolder) {
  const { mimetype: mimeDiizinkan, ekstensi: ekstensiDiizinkan } =
    JENIS_DIIZINKAN[folder];

  return {
    storage: diskStorage({
      destination: join(AKAR_UPLOAD, folder),
      filename: (_req, file, cb) => cb(null, namaBerkasBaru(file.mimetype)),
    }),
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, diterima: boolean) => void,
    ) => {
      // Mimetype dan ekstensi diperiksa berdua: mimetype mudah dipalsukan
      // pengirim, sedangkan ekstensi saja tidak memastikan isi berkasnya.
      const cocok =
        mimeDiizinkan.includes(file.mimetype) &&
        ekstensiDiizinkan.includes(extname(file.originalname).toLowerCase());

      cb(
        cocok
          ? null
          : new BadRequestException(
              PESAN_UPLOAD.JENIS_DITOLAK(ekstensiDiizinkan),
            ),
        cocok,
      );
    },
  };
}
