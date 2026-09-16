import { validate } from 'class-validator';
import { IsTanggalWujud } from './tanggal-wujud.validator';

class Contoh {
  @IsTanggalWujud()
  tanggal!: unknown;
}

const periksa = async (nilai: unknown) => {
  const obj = new Contoh();
  obj.tanggal = nilai;
  return (await validate(obj)).length === 0;
};

describe('IsTanggalWujud', () => {
  it('menerima tanggal biasa', async () => {
    for (const t of ['2026-08-30', '2026-01-01', '2026-12-31', '2027-02-28']) {
      await expect(periksa(t)).resolves.toBe(true);
    }
  });

  it('menerima 29 Februari pada tahun kabisat saja', async () => {
    await expect(periksa('2028-02-29')).resolves.toBe(true);
    await expect(periksa('2026-02-29')).resolves.toBe(false);
    await expect(periksa('2100-02-29')).resolves.toBe(false);
    await expect(periksa('2000-02-29')).resolves.toBe(true);
  });

  /**
   * Inilah sebabnya pemeriksaan ini ada: pola saja meloloskan tanggal seperti
   * 31 April, yang kemudian menggulung diam-diam menjadi 1 Mei.
   */
  it('menolak tanggal yang tidak ada pada kalender', async () => {
    for (const t of ['2027-02-30', '2027-04-31', '2027-06-31', '2027-09-31']) {
      await expect(periksa(t)).resolves.toBe(false);
    }
  });

  it('menolak bulan dan hari di luar jangkauan', async () => {
    for (const t of ['2027-00-10', '2027-13-01', '2027-01-00', '2027-01-32']) {
      await expect(periksa(t)).resolves.toBe(false);
    }
  });

  it('menolak format lain dan tipe selain teks', async () => {
    for (const t of [
      '30-08-2026',
      '2026/08/30',
      '2026-8-3',
      '',
      null,
      undefined,
      20260830,
      ['2026-08-30'],
      { tanggal: '2026-08-30' },
    ]) {
      await expect(periksa(t)).resolves.toBe(false);
    }
  });
});
