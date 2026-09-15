import { Maker } from '@prisma/client';

/** Kolom akun maker yang boleh keluar; `password` sengaja tidak pernah ikut. */
type MakerPublik = Pick<
  Maker,
  'id' | 'name' | 'username' | 'email' | 'app_key' | 'created_at'
>;

/** Bentuk untuk `GET /api/maker/me` dan `GET /api/maker/list`. */
export function serializeMaker(maker: MakerPublik) {
  return {
    id: maker.id,
    name: maker.name,
    username: maker.username,
    email: maker.email,
    app_key: maker.app_key,
    created_at: maker.created_at,
  };
}

/** Bentuk untuk registrasi, yang menurut soal juga menyertakan `updated_at`. */
export function serializeMakerBaru(maker: MakerPublik & { updated_at: Date }) {
  return { ...serializeMaker(maker), updated_at: maker.updated_at };
}

/** Bentuk untuk login, yang tidak menyertakan kolom waktu sama sekali. */
export function serializeMakerLogin(maker: Omit<MakerPublik, 'created_at'>) {
  return {
    id: maker.id,
    name: maker.name,
    username: maker.username,
    email: maker.email,
    app_key: maker.app_key,
  };
}
