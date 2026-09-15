/** Penanda jenis token, dipakai agar token maker tidak tertukar dengan token user. */
export const MAKER_TOKEN_TYPE = 'maker';

/**
 * Isi token akun siswa. Field `type` wajib ada supaya guard user nantinya dapat
 * menolak token maker, dan sebaliknya, meski keduanya ditandatangani secret yang
 * sama.
 */
export interface MakerJwtPayload {
  sub: number;
  username: string;
  app_key: string;
  type: typeof MAKER_TOKEN_TYPE;
}
