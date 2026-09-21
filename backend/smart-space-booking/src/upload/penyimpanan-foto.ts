import { v2 as cloudinary } from 'cloudinary';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { UploadFolder } from '../common/utils/foto.util';
import type {
  KonfigurasiFoto,
  KredensialCloudinary,
} from '../config/configuration';

/** Akar penyimpanan lokal, sama dengan folder yang disajikan statis di main.ts. */
export const AKAR_UPLOAD = join(process.cwd(), 'uploads');

/**
 * Menyimpan satu foto ke penyimpanan yang sedang dipakai.
 *
 * Nama berkasnya ditentukan pemanggil dan dipakai apa adanya di kedua
 * penyimpanan, sehingga yang dicatat di database selalu cukup nama berkas dan
 * URL-nya dibentuk dengan `buildFotoUrl` yang sama. Di Cloudinary, nama itu
 * menjadi public_id `<folder induk>/<folder>/<nama tanpa ekstensi>`; ekstensinya
 * ditambahkan kembali pada URL dan dipakai Cloudinary sebagai format kiriman.
 */
export async function simpanFoto(
  konfig: KonfigurasiFoto,
  folder: UploadFolder,
  nama: string,
  isi: Buffer,
): Promise<void> {
  if (konfig.penyimpanan === 'lokal') {
    const tujuan = join(AKAR_UPLOAD, folder);
    await mkdir(tujuan, { recursive: true });
    await writeFile(join(tujuan, nama), isi);
    return;
  }

  await unggahKeCloudinary(konfig.cloudinary, folder, nama, isi);
}

export function publicIdCloudinary(
  kredensial: KredensialCloudinary,
  folder: UploadFolder,
  nama: string,
): string {
  const tanpaEkstensi = nama.slice(0, nama.length - extname(nama).length);
  return `${kredensial.folder}/${folder}/${tanpaEkstensi}`;
}

function unggahKeCloudinary(
  kredensial: KredensialCloudinary,
  folder: UploadFolder,
  nama: string,
  isi: Buffer,
): Promise<void> {
  // Kredensial dipasang per unggahan, bukan lewat cloudinary.config() global,
  // supaya tidak bergantung pada urutan modul dimuat.
  return new Promise((selesai, gagal) => {
    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicIdCloudinary(kredensial, folder, nama),
          resource_type: 'image',
          overwrite: false,
          cloud_name: kredensial.cloudName,
          api_key: kredensial.apiKey,
          api_secret: kredensial.apiSecret,
        },
        (error) => (error ? gagal(new Error(error.message)) : selesai()),
      )
      .end(isi);
  });
}
