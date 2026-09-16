import { apiPost } from '@/lib/api/client';
import type { HasilUpload, HasilUploadLengkap } from '@/types/entities';

/**
 * Unggahan berkas gambar.
 *
 * Alurnya selalu dua langkah: berkas diunggah lebih dulu, lalu nama berkas hasil
 * unggahan dikirim sebagai field `foto` pada form utama. Foldernya menentukan
 * dari mana gambarnya nanti disajikan, sehingga endpointnya harus cocok dengan
 * jenis datanya.
 */
function kirimBerkas<T>(url: string, berkas: File) {
  const form = new FormData();
  form.append('file', berkas);

  return apiPost<T>(url, form);
}

/** Gambar umum, termasuk foto profil lokasi coworking (folder `general`). */
export const unggahGambar = (berkas: File) =>
  kirimBerkas<HasilUploadLengkap>('/upload/image', berkas);

/** Foto ruangan atau meja (folder `spaces`). */
export const unggahFotoSpace = (berkas: File) =>
  kirimBerkas<HasilUpload>('/upload/spaces', berkas);

/** Foto profil member (folder `members`). */
export const unggahFotoMember = (berkas: File) =>
  kirimBerkas<HasilUpload>('/upload/members', berkas);
