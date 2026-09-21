export type UploadFolder = 'spaces' | 'members' | 'general';

/**
 * Membentuk URL publik sebuah foto. Mengembalikan null bila foto belum diisi
 * agar frontend dapat menampilkan placeholder.
 *
 * `baseUrl` berasal dari konfigurasi `foto.baseUrl`: `<APP_URL>/uploads` untuk
 * penyimpanan lokal, atau alamat folder Cloudinary.
 */
export const buildFotoUrl = (
  baseUrl: string,
  folder: UploadFolder,
  foto?: string | null,
): string | null => (foto ? `${baseUrl}/${folder}/${foto}` : null);
