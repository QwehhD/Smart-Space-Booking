import { Diskon } from '@prisma/client';

/**
 * Bentuk baku kode promo, sama di seluruh endpoint admin maupun publik.
 *
 * `id_owner` disertakan supaya klien dapat mengetahui promo ini milik pengelola
 * yang mana, dan menyaring pilihan promo sesuai space yang sedang dipesan.
 */
export const serializeDiskon = (diskon: Diskon) => ({
  id: diskon.id,
  nama_diskon: diskon.nama_diskon,
  persentase_diskon: diskon.persentase_diskon,
  tanggal_awal: diskon.tanggal_awal,
  tanggal_akhir: diskon.tanggal_akhir,
  id_owner: diskon.id_owner,
});
