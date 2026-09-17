import { describe, expect, it } from 'vitest';
import {
  bandingkanTanggal,
  hariIniWib,
  inisial,
  namaBulan,
  rupiah,
  rupiahRingkas,
  tanggalDanJam,
  tanggalDenganHari,
  tanggalPanjang,
  tanggalPendek,
  waktuLengkap,
} from '@/lib/format';

/**
 * Pemformatan nilai untuk tampilan.
 *
 * Yang paling penting dijaga di sini adalah penanganan tanggal polos. Backend
 * mengirim tanggal sewa sebagai teks `YYYY-MM-DD` tanpa zona, dan melewatkannya
 * ke `new Date()` akan menafsirkannya sebagai tengah malam UTC lalu menggesernya
 * ke zona lokal. Di zona sebelah barat UTC hasilnya mundur satu hari.
 *
 * Pengujian ini berjalan dengan TZ=UTC, jadi untuk membuktikan fungsi-fungsi itu
 * benar-benar tidak bergantung zona, sebagiannya diperiksa ulang dengan zona
 * mesin yang digeser ke New York.
 */
describe('rupiah', () => {
  it('memberi jarak setelah simbol dan tanpa desimal', () => {
    expect(rupiah(360_000)).toBe('Rp 360.000');
  });

  it('menangani nol', () => {
    expect(rupiah(0)).toBe('Rp 0');
  });
});

describe('rupiahRingkas', () => {
  it('meringkas jutaan dan ribuan', () => {
    expect(rupiahRingkas(1_500_000)).toBe('1,5 jt');
    expect(rupiahRingkas(20_000)).toBe('20 rb');
  });

  it('membiarkan angka kecil apa adanya', () => {
    expect(rupiahRingkas(999)).toBe('999');
  });
});

describe('tanggal polos tidak bergantung zona waktu', () => {
  it('menampilkan hari yang sama persis seperti yang dikirim backend', () => {
    expect(tanggalPanjang('2026-05-24')).toBe('24 Mei 2026');
    expect(tanggalPendek('2026-05-24')).toBe('24 Mei');
  });

  it('tidak mundur sehari di zona sebelah barat UTC', () => {
    const asli = process.env.TZ;

    try {
      process.env.TZ = 'America/New_York';
      expect(tanggalPanjang('2026-05-24')).toBe('24 Mei 2026');
      expect(tanggalDenganHari('2026-05-24')).toBe('Minggu, 24 Mei 2026');
    } finally {
      process.env.TZ = asli;
    }
  });

  it('menghitung nama harinya dengan benar', () => {
    expect(tanggalDenganHari('2026-05-24')).toBe('Minggu, 24 Mei 2026');
    expect(tanggalDenganHari('2026-09-17')).toBe('Kamis, 17 September 2026');
  });
});

describe('tanggalDanJam', () => {
  it('memakai tanda pisah en dash di antara jamnya', () => {
    expect(tanggalDanJam('2026-05-24', '09:00', '12:00')).toBe(
      '24 Mei 2026 • 09:00–12:00',
    );
  });
});

describe('namaBulan', () => {
  it('menggabungkan nama bulan dan tahunnya', () => {
    expect(namaBulan(5, 2026)).toBe('Mei 2026');
    expect(namaBulan(12, 2026)).toBe('Desember 2026');
  });
});

describe('waktuLengkap', () => {
  it('menampilkan waktu penuh dalam WIB', () => {
    // 00:00 UTC adalah 07:00 WIB pada hari yang sama.
    expect(waktuLengkap('2026-05-24T00:00:00.000Z')).toBe('24 Mei 2026 • 07.00');
  });
});

describe('hariIniWib', () => {
  it('berbentuk YYYY-MM-DD', () => {
    expect(hariIniWib()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('bandingkanTanggal', () => {
  it('mengurutkan sesuai urutan waktunya', () => {
    expect(bandingkanTanggal('2026-01-01', '2026-01-02')).toBe(-1);
    expect(bandingkanTanggal('2026-01-02', '2026-01-01')).toBe(1);
    expect(bandingkanTanggal('2026-01-01', '2026-01-01')).toBe(0);
  });

  it('menyeberangi pergantian bulan dan tahun dengan benar', () => {
    expect(bandingkanTanggal('2026-01-31', '2026-02-01')).toBe(-1);
    expect(bandingkanTanggal('2026-12-31', '2027-01-01')).toBe(-1);
  });
});

describe('inisial', () => {
  it('mengambil dua huruf pertama dari dua kata pertama', () => {
    expect(inisial('Budi Raharjo')).toBe('BR');
    expect(inisial('Siti Nurhaliza Putri')).toBe('SN');
  });

  it('menangani satu kata', () => {
    expect(inisial('Budi')).toBe('B');
  });

  it('menangani spasi berlebih', () => {
    expect(inisial('  Budi   Raharjo  ')).toBe('BR');
  });
});
