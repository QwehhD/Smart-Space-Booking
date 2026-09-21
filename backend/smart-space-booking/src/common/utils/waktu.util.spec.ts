import {
  dateUtcKeTanggal,
  hitungJamSelesai,
  jamKeMenit,
  menitKeJam,
  tanggalHariIni,
  tanggalKeDateUtc,
} from './waktu.util';

describe('util waktu', () => {
  it('mengubah jam menjadi menit dan sebaliknya', () => {
    expect(jamKeMenit('09:00')).toBe(540);
    expect(jamKeMenit('00:00')).toBe(0);
    expect(jamKeMenit('23:59')).toBe(1439);
    expect(menitKeJam(540)).toBe('09:00');
    expect(menitKeJam(0)).toBe('00:00');
    expect(menitKeJam(1439)).toBe('23:59');
  });

  it('selalu memakai dua digit agar perbandingan teks sama dengan perbandingan waktu', () => {
    expect(menitKeJam(9 * 60)).toBe('09:00');
    expect('09:00' < '10:00').toBe(true);
    expect('09:00' < '12:00').toBe(true);
  });

  it('menghitung jam selesai dari durasi', () => {
    expect(hitungJamSelesai('09:00', 3)).toBe('12:00');
    expect(hitungJamSelesai('13:30', 1)).toBe('14:30');
    expect(hitungJamSelesai('22:00', 2)).toBe('24:00');
  });

  it('menolak durasi yang melewati tengah malam', () => {
    expect(hitungJamSelesai('23:00', 2)).toBeNull();
    expect(hitungJamSelesai('22:30', 2)).toBeNull();
  });

  /**
   * Aplikasi berjalan pada TZ=Asia/Jakarta. Tanpa penyusunan komponen UTC secara
   * eksplisit, tanggal akan tersimpan mundur satu hari.
   */
  it('mengubah tanggal tanpa tergeser zona waktu', () => {
    const tanggal = tanggalKeDateUtc('2026-08-30');

    expect(tanggal.toISOString()).toBe('2026-08-30T00:00:00.000Z');
    expect(dateUtcKeTanggal(tanggal)).toBe('2026-08-30');
  });

  it('bolak-balik tanggal tetap menghasilkan nilai yang sama', () => {
    for (const tanggal of ['2026-01-01', '2026-06-15', '2026-12-31']) {
      expect(dateUtcKeTanggal(tanggalKeDateUtc(tanggal))).toBe(tanggal);
    }
  });

  it('membaca tanggal hari ini dari jam lokal, bukan dari UTC', () => {
    // Pukul 03.00 waktu lokal; di WIB, toISOString() masih menunjuk hari kemarin.
    expect(tanggalHariIni(new Date(2026, 8, 22, 3, 0))).toBe('2026-09-22');
    expect(tanggalHariIni(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
