import { describe, expect, it } from 'vitest';
import { JAM_BUKA, JAM_TUTUP } from '@/lib/constants';
import {
  dalamJamOperasional,
  durasiMaksimal,
  hitungJamSelesai,
  jamKeMenit,
  menitKeJam,
  pilihanDurasi,
  pilihanJamMulai,
} from '@/lib/jadwal';

/**
 * Batasan jam pada form pemesanan.
 *
 * Aturannya sengaja sama dengan yang ditegakkan backend: sewa harus di dalam jam
 * operasional dan tidak boleh melewati tengah malam. Perhitungan di sini hanya
 * membatasi pilihan; penolakan sebenarnya tetap di backend. Pengujian ini
 * menjaga agar yang ditawarkan tidak pernah lebih longgar daripada yang
 * diterima backend.
 */
describe('jamKeMenit dan menitKeJam', () => {
  it('bolak-balik tanpa berubah', () => {
    for (const jam of ['00:00', '07:00', '09:30', '22:00', '23:59']) {
      expect(menitKeJam(jamKeMenit(jam))).toBe(jam);
    }
  });

  it('selalu memakai dua digit', () => {
    expect(menitKeJam(0)).toBe('00:00');
    expect(menitKeJam(9 * 60)).toBe('09:00');
  });
});

describe('hitungJamSelesai', () => {
  it('menambahkan durasi ke jam mulai', () => {
    expect(hitungJamSelesai('09:00', 3)).toBe('12:00');
  });

  it('menghasilkan 24:00 untuk sewa yang berakhir tepat tengah malam', () => {
    expect(hitungJamSelesai('22:00', 2)).toBe('24:00');
  });
});

describe('durasiMaksimal', () => {
  it('memberi sisa jam sampai tutup', () => {
    // Tutup 22:00, mulai 19:00, jadi tersisa tiga jam.
    expect(durasiMaksimal('19:00')).toBe(3);
  });

  it('memberi nol tepat pada jam tutup', () => {
    expect(durasiMaksimal(JAM_TUTUP)).toBe(0);
  });

  it('memberi nol untuk jam setelah tutup', () => {
    expect(durasiMaksimal('23:00')).toBe(0);
  });
});

describe('pilihanDurasi', () => {
  it('mulai dari satu jam dan berakhir di durasi maksimal', () => {
    expect(pilihanDurasi('19:00')).toEqual([1, 2, 3]);
  });

  it('kosong bila tidak ada sisa waktu', () => {
    expect(pilihanDurasi(JAM_TUTUP)).toEqual([]);
  });

  /** Setiap durasi yang ditawarkan harus lolos pemeriksaan jam operasional. */
  it('seluruh pilihannya masih di dalam jam operasional', () => {
    for (const jam of pilihanJamMulai('2027-01-01')) {
      for (const durasi of pilihanDurasi(jam)) {
        expect(dalamJamOperasional(jam, durasi)).toBe(true);
      }
    }
  });
});

describe('pilihanJamMulai', () => {
  const BESOK = '2027-01-02';

  it('mulai dari jam buka dan berhenti satu jam sebelum tutup', () => {
    const pilihan = pilihanJamMulai(BESOK, { tanggal: '2027-01-01', jam: '10:00' });

    expect(pilihan[0]).toBe(JAM_BUKA);
    expect(hitungJamSelesai(pilihan[pilihan.length - 1], 1)).toBe(JAM_TUTUP);
  });

  it('membuang jam yang sudah lewat bila tanggalnya hari ini', () => {
    const pilihan = pilihanJamMulai(BESOK, { tanggal: BESOK, jam: '14:00' });

    expect(pilihan.every((jam) => jam > '14:00')).toBe(true);
    expect(pilihan).not.toContain('14:00');
    expect(pilihan).toContain('15:00');
  });

  it('tidak membuang apa pun untuk tanggal selain hari ini', () => {
    const hariIni = pilihanJamMulai(BESOK, { tanggal: BESOK, jam: '14:00' });
    const hariLain = pilihanJamMulai(BESOK, { tanggal: '2027-01-01', jam: '14:00' });

    expect(hariLain.length).toBeGreaterThan(hariIni.length);
  });

  it('kosong bila hari ini sudah lewat jam terakhir', () => {
    expect(pilihanJamMulai(BESOK, { tanggal: BESOK, jam: '23:59' })).toEqual([]);
  });
});

describe('dalamJamOperasional', () => {
  it('menerima sewa yang berakhir tepat pada jam tutup', () => {
    expect(dalamJamOperasional('21:00', 1)).toBe(true);
  });

  it('menolak sewa yang melewati jam tutup', () => {
    expect(dalamJamOperasional('21:00', 2)).toBe(false);
  });

  it('menolak sewa yang mulai sebelum jam buka', () => {
    expect(dalamJamOperasional('06:00', 1)).toBe(false);
  });
});
