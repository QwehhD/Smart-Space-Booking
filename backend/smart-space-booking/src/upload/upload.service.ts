import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildFotoUrl, UploadFolder } from '../common/utils/foto.util';
import { PESAN_UPLOAD } from './upload.constant';

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Bentuk lengkap untuk unggahan gambar umum, yang menurut soal juga memuat
   * nama asli, mimetype, dan ukuran berkas.
   */
  hasilLengkap(file: Express.Multer.File | undefined) {
    const berkas = this.pastikanAda(file);

    return {
      filename: berkas.filename,
      original_name: berkas.originalname,
      mimetype: berkas.mimetype,
      size: berkas.size,
      url: this.url('general', berkas.filename),
    };
  }

  /** Bentuk ringkas untuk foto space dan foto member. */
  hasilRingkas(file: Express.Multer.File | undefined, folder: UploadFolder) {
    const berkas = this.pastikanAda(file);

    return {
      filename: berkas.filename,
      url: this.url(folder, berkas.filename),
    };
  }

  /**
   * Berkas bernilai undefined ketika field `file` tidak dikirim sama sekali.
   * Multer tidak menganggap itu kesalahan, jadi harus ditolak di sini.
   */
  private pastikanAda(file?: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException(PESAN_UPLOAD.BERKAS_KOSONG);
    }

    return file;
  }

  private url(folder: UploadFolder, filename: string): string {
    const appUrl = this.config.get<string>('appUrl') ?? 'http://localhost:3000';

    return buildFotoUrl(appUrl, folder, filename) as string;
  }
}
