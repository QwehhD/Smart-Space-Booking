import {
  hitungPotongan,
  hitungTarifKotor,
  hitungTotalBayar,
} from './uang.util';

describe('util uang', () => {
  it('menghitung tarif kotor dari harga per jam dan durasi', () => {
    expect(hitungTarifKotor(20000, 3)).toBe(60000);
    expect(hitungTarifKotor(100000, 1)).toBe(100000);
  });

  it('menghitung potongan sesuai contoh pada soal', () => {
    expect(hitungPotongan(60000, 20)).toBe(12000);
    expect(hitungTotalBayar(60000, 12000)).toBe(48000);
  });

  it('membulatkan potongan ke bawah agar tidak melebihi persentasenya', () => {
    // 33% dari 10.000 adalah 3.300 tepat, sedangkan 33% dari 999 adalah 329,67.
    expect(hitungPotongan(10000, 33)).toBe(3300);
    expect(hitungPotongan(999, 33)).toBe(329);
    expect(hitungPotongan(1, 50)).toBe(0);
  });

  it('menghasilkan bilangan bulat untuk persentase apa pun', () => {
    for (let persen = 1; persen <= 100; persen += 1) {
      expect(Number.isInteger(hitungPotongan(77777, persen))).toBe(true);
    }
  });

  it('menangani diskon 100 persen tanpa menjadi negatif', () => {
    const potongan = hitungPotongan(60000, 100);

    expect(potongan).toBe(60000);
    expect(hitungTotalBayar(60000, potongan)).toBe(0);
  });

  it('tidak memotong apa pun bila persentasenya nol', () => {
    expect(hitungPotongan(60000, 0)).toBe(0);
    expect(hitungTotalBayar(60000, 0)).toBe(60000);
  });
});
