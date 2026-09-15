import { Space } from '@prisma/client';
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
export const serializeSpace = (space: Space, appUrl: string) => ({
  id: space.id,
  nama_space: space.nama_space,
  harga_per_jam: space.harga_per_jam,
  tipe: space.tipe,
  kapasitas: space.kapasitas,
  deskripsi: space.deskripsi,
  foto: space.foto,
  foto_url: buildFotoUrl(appUrl, 'spaces', space.foto),
  id_owner: space.id_owner,
});
