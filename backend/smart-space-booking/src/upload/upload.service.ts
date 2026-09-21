import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildFotoUrl, UploadFolder } from '../common/utils/foto.util';
import type { KonfigurasiFoto } from '../config/configuration';
import { simpanFoto } from './penyimpanan-foto';
import { PESAN_UPLOAD } from './upload.constant';
import { namaBerkasBaru } from './upload.storage';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Bentuk lengkap untuk unggahan gambar umum, yang menurut soal juga memuat
   * nama asli, mimetype, dan ukuran berkas.
   */
  async hasilLengkap(file: Express.Multer.File | undefined) {
    const berkas = this.pastikanAda(file);
    const filename = await this.simpan(berkas, 'general');

    return {
      filename,
      original_name: berkas.originalname,
      mimetype: berkas.mimetype,
      size: berkas.size,
      url: this.url('general', filename),
    };
  }

  /** Bentuk ringkas untuk foto space dan foto member. */
  async hasilRingkas(
    file: Express.Multer.File | undefined,
    folder: UploadFolder,
  ) {
    const filename = await this.simpan(this.pastikanAda(file), folder);

    return { filename, url: this.url(folder, filename) };
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

  /**
   * Kegagalan penyimpanan, misalnya Cloudinary tidak terjangkau, dilaporkan
   * sebagai 503 dengan pesan umum. Rinciannya hanya dicatat di log karena dapat
   * memuat nama cloud atau keterangan kredensial.
   */
  private async simpan(
    berkas: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<string> {
    const nama = namaBerkasBaru(berkas.mimetype);

    try {
      await simpanFoto(this.foto, folder, nama, berkas.buffer);
    } catch (error) {
      this.logger.error(
        `Gagal menyimpan foto ${folder}/${nama}: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(PESAN_UPLOAD.GAGAL_MENYIMPAN);
    }

    return nama;
  }

  private url(folder: UploadFolder, filename: string): string {
    return buildFotoUrl(this.foto.baseUrl, folder, filename) as string;
  }

  private get foto(): KonfigurasiFoto {
    return this.config.getOrThrow<KonfigurasiFoto>('foto');
  }
}
