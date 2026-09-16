/**
 * Pratinjau harga di sisi klien.
 *
 * Rumusnya disalin persis dari `backend/src/common/utils/uang.util.ts` supaya
 * angka yang ditampilkan sebelum memesan sama dengan yang nanti ditagihkan.
 * Angka yang ditampilkan setelah pemesanan berhasil tetap diambil dari response
 * backend, bukan dari perhitungan ini.
 */

/**
 * Potongan dibulatkan ke bawah, sama seperti backend, agar tidak pernah
 * melebihi persentase yang dijanjikan. Selisihnya paling banyak satu rupiah.
 */
export function hitungPotongan(total: number, persentase: number): number {
  return Math.floor((total * persentase) / 100);
}

/** Total setelah potongan; tidak pernah negatif meski diskon 100 persen. */
export function hitungTotalBayar(total: number, potongan: number): number {
  return Math.max(0, total - potongan);
}

/** Tarif kotor sebelum diskon. */
export function hitungTarifKotor(hargaPerJam: number, durasiJam: number): number {
  return hargaPerJam * durasiJam;
}

export interface RincianHarga {
  tarif_kotor: number;
  persentase_diskon: number;
  potongan: number;
  total_bayar: number;
}

/** Rincian lengkap untuk ringkasan harga pada form pemesanan. */
export function hitungRincian(
  hargaPerJam: number,
  durasiJam: number,
  persentaseDiskon = 0,
): RincianHarga {
  const tarifKotor = hitungTarifKotor(hargaPerJam, durasiJam);
  const potongan = hitungPotongan(tarifKotor, persentaseDiskon);

  return {
    tarif_kotor: tarifKotor,
    persentase_diskon: persentaseDiskon,
    potongan,
    total_bayar: hitungTotalBayar(tarifKotor, potongan),
  };
}
