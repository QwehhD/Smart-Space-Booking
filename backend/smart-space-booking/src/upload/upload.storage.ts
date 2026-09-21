import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { UploadFolder } from '../common/utils/foto.util';
import {
  EKSTENSI_MIMETYPE,
  JENIS_DIIZINKAN,
  PESAN_UPLOAD,
} from './upload.constant';

/**
 * Nama berkas dibuat dari waktu dan angka acak, mengikuti contoh pada soal
 * (`1787799592972-544446318.jpeg`). Nama asli kiriman tidak pernah dipakai agar
 * tidak ada berkas yang saling menimpa dan tidak ada nama yang dapat keluar dari
 * folder tujuan.
 */
export function namaBerkasBaru(mimetype: string): string {
  const acak = Math.round(Math.random() * 1e9);
  return `${Date.now()}-${acak}${EKSTENSI_MIMETYPE[mimetype] ?? ''}`;
}

/**
 * Opsi multer untuk satu folder tujuan. Batas ukuran tidak diatur di sini
 * melainkan di MulterModule, supaya nilainya tetap berasal dari ConfigService.
 *
 * Berkas ditahan di memori, bukan langsung ditulis ke disk, karena tujuannya
 * baru diputuskan UploadService: folder lokal atau Cloudinary. Decorator ini
 * dievaluasi sebelum konfigurasi termuat, jadi keputusan itu tidak dapat
 * diambil di sini. Batas ukurannya kecil, sehingga menahan di memori aman.
 */
export function opsiUpload(folder: UploadFolder) {
  const { mimetype: mimeDiizinkan, ekstensi: ekstensiDiizinkan } =
    JENIS_DIIZINKAN[folder];

  return {
    storage: memoryStorage(),
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
