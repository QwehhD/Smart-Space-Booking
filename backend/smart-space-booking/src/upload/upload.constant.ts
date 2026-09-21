import { UploadFolder } from '../common/utils/foto.util';

/**
 * Jenis berkas yang diterima per folder tujuan.
 *
 * Soal mengizinkan `.webp` hanya pada unggahan gambar umum, sedangkan foto space
 * dan foto member dibatasi pada JPEG dan PNG, sehingga perbedaannya dipertahankan.
 */
export const JENIS_DIIZINKAN: Record<
  UploadFolder,
  { mimetype: string[]; ekstensi: string[] }
> = {
  general: {
    mimetype: ['image/jpeg', 'image/png', 'image/webp'],
    ekstensi: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  spaces: {
    mimetype: ['image/jpeg', 'image/png'],
    ekstensi: ['.jpg', '.jpeg', '.png'],
  },
  members: {
    mimetype: ['image/jpeg', 'image/png'],
    ekstensi: ['.jpg', '.jpeg', '.png'],
  },
};

/**
 * Ekstensi berkas ditentukan dari mimetype, bukan dari nama berkas kiriman,
 * supaya nama yang disusun penyerang tidak menentukan nama berkas di server.
 */
export const EKSTENSI_MIMETYPE: Record<string, string> = {
  'image/jpeg': '.jpeg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const PESAN_UPLOAD = {
  BERKAS_KOSONG: 'Berkas wajib diunggah pada field "file"!',
  TERLALU_BESAR: (maxMb: number) => `Ukuran berkas melebihi batas ${maxMb} MB!`,
  JENIS_DITOLAK: (ekstensi: string[]) =>
    `Jenis berkas tidak diizinkan. Gunakan ${ekstensi.join(', ')}.`,
  GAGAL_MENYIMPAN: 'Foto gagal disimpan. Silakan coba beberapa saat lagi.',
} as const;
