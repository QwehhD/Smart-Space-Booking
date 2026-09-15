/**
 * Header penanda pemilik data. Soal menyebut `x-maker-key` sebagai header utama
 * dan `x-app-key` sebagai alias, jadi keduanya diterima.
 */
export const MAKER_KEY_HEADERS = ['x-maker-key', 'x-app-key'] as const;

/** Awalan app key sesuai contoh pada soal, misalnya `mk_4ffb8c4b...`. */
export const APP_KEY_PREFIX = 'mk_';

/** Panjang bagian acak app key dalam byte; 16 byte menjadi 32 karakter hex. */
export const APP_KEY_RANDOM_BYTES = 16;

/** App key milik maker bawaan, dipakai saat request tidak menyertakan header. */
export const DEFAULT_APP_KEY = 'mk_default_ukk_2026';

/** Identitas maker bawaan, mengikuti contoh `GET /api/maker/list` pada soal. */
export const DEFAULT_MAKER_PROFILE = {
  name: 'Admin Default UKK',
  username: 'admin_default',
  email: 'admin@ukk.sch.id',
  app_key: DEFAULT_APP_KEY,
} as const;

export const PESAN_MAKER = {
  APP_KEY_TIDAK_DIKENAL: 'App key tidak dikenal atau sudah tidak berlaku!',
} as const;
