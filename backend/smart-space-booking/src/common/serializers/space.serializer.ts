import { Space, SpaceOwner } from '@prisma/client';
import { buildFotoUrl } from '../utils/foto.util';

/**
 * Bentuk baku data space.
 *
 * Contoh pada soal berbeda-beda antar endpoint: daftar menyertakan `foto_url`
 * tetapi tidak `deskripsi`, detail tidak menyertakan `foto_url`, dan pembuatan
 * menyertakan `id_owner`. Di sini semuanya dikembalikan dalam satu bentuk yang
 * sama, karena field tambahan bersifat menambah dan klien yang hanya membaca
 * field pada contoh tetap bekerja, sementara bentuk yang berbeda-beda justru
 * menyulitkan frontend memakai ulang komponen yang sama.
 */
export const serializeSpace = (space: Space, fotoBaseUrl: string) => ({
  id: space.id,
  nama_space: space.nama_space,
  harga_per_jam: space.harga_per_jam,
  tipe: space.tipe,
  kapasitas: space.kapasitas,
  deskripsi: space.deskripsi,
  foto: space.foto,
  foto_url: buildFotoUrl(fotoBaseUrl, 'spaces', space.foto),
  id_owner: space.id_owner,
});

/**
 * Bentuk space untuk katalog publik, yang menurut soal menyertakan data pengelola
 * agar calon penyewa tahu lokasi mana yang menyewakan tanpa perlu satu request
 * tambahan per space.
 *
 * Contoh pada soal menyertakan `owner.id` di detail tetapi tidak di daftar;
 * seperti pada keputusan nomor 25, keduanya disamakan.
 */
export const serializeSpacePublik = (
  space: Space & { owner: SpaceOwner },
  fotoBaseUrl: string,
) => ({
  ...serializeSpace(space, fotoBaseUrl),
  owner: {
    id: space.owner.id,
    nama_coworking: space.owner.nama_coworking,
    nama_pemilik: space.owner.nama_pemilik,
    telp: space.owner.telp,
  },
});
