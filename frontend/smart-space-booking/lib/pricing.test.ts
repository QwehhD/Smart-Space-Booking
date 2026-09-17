import { describe, expect, it } from 'vitest';
import {
  hitungPotongan,
  hitungRincian,
  hitungTarifKotor,
  hitungTotalBayar,
} from '@/lib/pricing';

/**
 * Pratinjau harga harus sama persis dengan yang nanti ditagihkan backend.
 *
 * Rumusnya disalin dari `backend/src/common/utils/uang.util.ts`, jadi pengujian
 * ini menjaga salinannya tetap sama. Bila backend mengubah pembulatannya,
 * pengujian di sini harus ikut gagal, bukan diam-diam menampilkan angka lain
 * daripada yang ditagihkan.
 */
describe('hitungPotongan', () => {
  it('membulatkan ke bawah, bukan ke terdekat', () => {
    // 10 persen dari 1.999 adalah 199,9; backend memakai Math.floor.
    expect(hitungPotongan(1999, 10)).toBe(199);
  });

  it('tidak pernah melebihi persentase yang dijanjikan', () => {
    for (const total of [1, 7, 33, 999, 60_000]) {
      for (const persen of [1, 17, 50, 99]) {
        const potongan = hitungPotongan(total, persen);
        expect(potongan).toBeLessThanOrEqual((total * persen) / 100);
      }
    }
  });

  it('memberi nol untuk persentase nol', () => {
    expect(hitungPotongan(60_000, 0)).toBe(0);
  });

  it('memberi seluruhnya untuk persentase seratus', () => {
    expect(hitungPotongan(60_000, 100)).toBe(60_000);
  });
});

describe('hitungTotalBayar', () => {
  it('mengurangi potongan dari total', () => {
    expect(hitungTotalBayar(60_000, 12_000)).toBe(48_000);
  });

  it('tidak pernah negatif meski potongannya melebihi total', () => {
    expect(hitungTotalBayar(10_000, 15_000)).toBe(0);
  });
});

describe('hitungTarifKotor', () => {
  it('mengalikan tarif per jam dengan durasinya', () => {
    expect(hitungTarifKotor(20_000, 3)).toBe(60_000);
  });

  it('memberi nol untuk durasi nol', () => {
    expect(hitungTarifKotor(20_000, 0)).toBe(0);
  });
});

describe('hitungRincian', () => {
  /**
   * Angka ini diambil dari pengujian e2e backend: space 20.000 per jam selama
   * tiga jam dengan promo 20 persen menghasilkan 60.000, potongan 12.000, dan
   * total bayar 48.000.
   */
  it('cocok dengan contoh yang diuji backend', () => {
    expect(hitungRincian(20_000, 3, 20)).toEqual({
      tarif_kotor: 60_000,
      persentase_diskon: 20,
      potongan: 12_000,
      total_bayar: 48_000,
    });
  });

  it('memperlakukan tanpa promo sebagai potongan nol', () => {
    expect(hitungRincian(20_000, 1)).toEqual({
      tarif_kotor: 20_000,
      persentase_diskon: 0,
      potongan: 0,
      total_bayar: 20_000,
    });
  });

  it('menjaga tarif kotor dikurangi potongan selalu sama dengan total bayar', () => {
    for (const [harga, durasi, persen] of [
      [18_000, 1, 15],
      [90_000, 2, 33],
      [150_000, 4, 7],
      [1, 1, 99],
    ]) {
      const r = hitungRincian(harga, durasi, persen);
      expect(r.tarif_kotor - r.potongan).toBe(r.total_bayar);
    }
  });
});
