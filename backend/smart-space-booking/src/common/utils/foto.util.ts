export type UploadFolder = 'spaces' | 'members' | 'general';

/**
 * Membentuk URL publik sebuah foto. Mengembalikan null bila foto belum diisi
 * agar frontend dapat menampilkan placeholder.
 */
export const buildFotoUrl = (
  appUrl: string,
  folder: UploadFolder,
  foto?: string | null,
): string | null => (foto ? `${appUrl}/uploads/${folder}/${foto}` : null);
