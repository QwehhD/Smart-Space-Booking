import 'dotenv/config';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { UploadFolder } from '../src/common/utils/foto.util';
import { konfigurasiFoto } from '../src/config/configuration';
import { AKAR_UPLOAD, simpanFoto } from '../src/upload/penyimpanan-foto';

const FOLDER: UploadFolder[] = ['spaces', 'members', 'general'];

/**
 * Mengunggah seluruh foto di folder `uploads/` lokal ke Cloudinary.
 *
 * Nama berkasnya dipertahankan, sehingga baris database yang sudah ada, termasuk
 * foto contoh dari seeder, langsung menunjuk ke foto yang sama begitu
 * `CLOUDINARY_URL` diisi. Tidak ada baris database yang diubah.
 *
 * Aman dijalankan berulang: foto yang sudah ada di Cloudinary tidak ditimpa.
 */
async function main() {
  const konfig = konfigurasiFoto(
    process.env,
    process.env.APP_URL ?? 'http://localhost:3000',
  );

  if (konfig.penyimpanan !== 'cloudinary') {
    console.error('CLOUDINARY_URL belum diisi pada .env.');
    process.exitCode = 1;
    return;
  }

  let berhasil = 0;
  let gagal = 0;

  for (const folder of FOLDER) {
    const nama = await readdir(join(AKAR_UPLOAD, folder)).catch(() => []);

    for (const berkas of nama.filter((n) => !n.startsWith('.'))) {
      try {
        const isi = await readFile(join(AKAR_UPLOAD, folder, berkas));
        await simpanFoto(konfig, folder, berkas, isi);
        console.log(`✓ ${folder}/${berkas}`);
        berhasil++;
      } catch (error) {
        console.error(`✗ ${folder}/${berkas}: ${(error as Error).message}`);
        gagal++;
      }
    }
  }

  console.log(`\n${berhasil} foto terunggah, ${gagal} gagal.`);
  if (gagal > 0) process.exitCode = 1;
}

void main();
