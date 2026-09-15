/**
 * Perhitungan nilai rupiah.
 *
 * Seluruh nilai uang bertipe integer sesuai soal, sehingga tidak ada pecahan
 * sen yang perlu disimpan dan setiap pembulatan harus dilakukan secara sadar.
 */

/**
 * Potongan harga dari sebuah persentase.
 *
 * Hasilnya dibulatkan ke bawah agar potongan tidak pernah melebihi persentase
 * yang dijanjikan, dan agar total bayar tidak pernah lebih kecil dari yang
 * seharusnya diterima pengelola. Selisihnya paling banyak satu rupiah.
 */
export function hitungPotongan(total: number, persentase: number): number {
  return Math.floor((total * persentase) / 100);
}

/** Total setelah potongan; tidak pernah negatif meski diskon 100 persen. */
export function hitungTotalBayar(total: number, potongan: number): number {
  return Math.max(0, total - potongan);
}

/** Tarif kotor sebelum diskon. */
export function hitungTarifKotor(
  hargaPerJam: number,
  durasiJam: number,
): number {
  return hargaPerJam * durasiJam;
}
