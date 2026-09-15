import { Diskon } from '@prisma/client';

/** Bentuk baku kode promo, sama di seluruh endpoint admin maupun publik. */
export const serializeDiskon = (diskon: Diskon) => ({
  id: diskon.id,
  nama_diskon: diskon.nama_diskon,
  persentase_diskon: diskon.persentase_diskon,
  tanggal_awal: diskon.tanggal_awal,
  tanggal_akhir: diskon.tanggal_akhir,
});
