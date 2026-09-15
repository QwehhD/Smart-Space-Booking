import { TipeSpace } from '@prisma/client';

/**
 * Keterangan tipe space untuk `GET /api/spaces/types`.
 *
 * Isinya tetap dan tidak disimpan di database karena merupakan penjelasan
 * kategori, bukan data milik satu pengelola. Teksnya mengikuti contoh pada soal.
 */
export const TIPE_SPACE: ReadonlyArray<{
  tipe: TipeSpace;
  label: string;
  deskripsi: string;
}> = [
  {
    tipe: TipeSpace.desk,
    label: 'Personal Desk',
    deskripsi:
      'Meja kerja individual yang nyaman dengan fasilitas colokan listrik, WiFi kencang, dan air minum.',
  },
  {
    tipe: TipeSpace.meeting_room,
    label: 'Meeting Room',
    deskripsi:
      'Ruang rapat tertutup dengan fasilitas proyektor/TV LED, whiteboard, sound system, dan AC dingin.',
  },
  {
    tipe: TipeSpace.private_office,
    label: 'Private Office',
    deskripsi:
      'Ruang kantor privat eksklusif untuk tim kecil hingga menengah dengan akses fleksibel dan keamanan 24 jam.',
  },
];

export const PESAN_SPACE = {
  TIDAK_DITEMUKAN: 'Space dengan ID tersebut tidak ditemukan!',
  SUDAH_DIBOOKING: 'Maaf, space sudah terisi atau dibooking pada jam tersebut!',
  TERSEDIA: 'Space tersedia untuk dipesan pada jadwal yang diminta',
} as const;
