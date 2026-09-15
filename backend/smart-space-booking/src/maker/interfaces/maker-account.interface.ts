/** Akun maker terautentikasi; sengaja tanpa `password`. */
export interface MakerAccount {
  id: number;
  name: string;
  username: string;
  email: string;
  app_key: string;
  created_at: Date;
}
