import { describe, expect, it } from 'vitest';
import { bacaBulanTahun } from '@/lib/bulan';
import { hariIniWib } from '@/lib/format';

/**
 * Pembacaan bulan dan tahun dari parameter URL.
 *
 * Nilainya datang langsung dari alamat yang dapat diketik siapa saja, sehingga
 * yang dijaga di sini adalah bahwa nilai ngawur jatuh ke bulan berjalan alih-alih
 * diteruskan ke backend dan berujung 400.
 */
describe('bacaBulanTahun', () => {
  const [tahunIni, bulanIni] = hariIniWib().split('-').map(Number);
  const bulanBerjalan = { month: bulanIni, year: tahunIni };

  it('membaca nilai yang sah', () => {
    expect(bacaBulanTahun('8', '2026')).toEqual({ month: 8, year: 2026 });
  });

  it('menerima batas bawah dan atas bulan', () => {
    expect(bacaBulanTahun('1', '2026').month).toBe(1);
    expect(bacaBulanTahun('12', '2026').month).toBe(12);
  });

  it('jatuh ke bulan berjalan bila parameternya tidak ada', () => {
    expect(bacaBulanTahun(undefined, undefined)).toEqual(bulanBerjalan);
  });

  it('menolak bulan di luar 1 sampai 12', () => {
    expect(bacaBulanTahun('0', '2026').month).toBe(bulanIni);
    expect(bacaBulanTahun('13', '2026').month).toBe(bulanIni);
    expect(bacaBulanTahun('99', '2026').month).toBe(bulanIni);
    expect(bacaBulanTahun('-3', '2026').month).toBe(bulanIni);
  });

  it('menolak bulan pecahan', () => {
    expect(bacaBulanTahun('8.5', '2026').month).toBe(bulanIni);
  });

  it('menolak teks yang bukan angka', () => {
    expect(bacaBulanTahun('abc', 'xyz')).toEqual(bulanBerjalan);
  });

  it('menolak tahun di luar rentang yang masuk akal', () => {
    expect(bacaBulanTahun('8', '1800').year).toBe(tahunIni);
    expect(bacaBulanTahun('8', '9999').year).toBe(tahunIni);
  });

  /** searchParams Next dapat berupa array bila parameternya ditulis berulang. */
  it('mengabaikan nilai berbentuk array', () => {
    expect(bacaBulanTahun(['8', '9'], ['2026'])).toEqual(bulanBerjalan);
  });

  it('menilai bulan dan tahun secara terpisah', () => {
    // Bulannya sah tetapi tahunnya tidak; hanya tahunnya yang diganti.
    expect(bacaBulanTahun('3', 'ngawur')).toEqual({ month: 3, year: tahunIni });
  });
});
