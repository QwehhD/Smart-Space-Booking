/**
 * Identitas tenant yang menjadi pemilik data pada satu request. Sengaja hanya
 * memuat kolom yang dibutuhkan service lain agar tidak ada data akun maker
 * (termasuk password) yang beredar di dalam request.
 */
export interface MakerContext {
  id: number;
  app_key: string;
}
