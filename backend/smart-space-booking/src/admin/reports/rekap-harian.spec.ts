import { rekapPerHari } from './rekap-harian';

const hari = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe('rekapPerHari', () => {
  it('memuat setiap hari dalam bulan, termasuk yang kosong', () => {
    const hasil = rekapPerHari(
      [{ tanggal: hari('2026-08-03'), total: 5000 }],
      2026,
      8,
    );

    expect(hasil).toHaveLength(31);
    expect(hasil[0]).toEqual({ tanggal: '2026-08-01', total: 0 });
    expect(hasil[2]).toEqual({ tanggal: '2026-08-03', total: 5000 });
    expect(hasil[30]).toEqual({ tanggal: '2026-08-31', total: 0 });
  });

  it('mengetahui panjang bulan yang berbeda-beda', () => {
    expect(rekapPerHari([], 2026, 2)).toHaveLength(28);
    expect(rekapPerHari([], 2028, 2)).toHaveLength(29);
    expect(rekapPerHari([], 2026, 4)).toHaveLength(30);
    expect(rekapPerHari([], 2026, 12)).toHaveLength(31);
  });

  it('menjumlahkan beberapa baris pada tanggal yang sama', () => {
    const hasil = rekapPerHari(
      [
        { tanggal: hari('2026-08-10'), total: 20000 },
        { tanggal: hari('2026-08-10'), total: 30000 },
        { tanggal: hari('2026-08-11'), total: 1000 },
      ],
      2026,
      8,
    );

    expect(hasil[9].total).toBe(50000);
    expect(hasil[10].total).toBe(1000);
  });

  /**
   * Inilah alasan fungsi ini murni: jumlah seluruh harinya harus sama persis
   * dengan total laporan, karena keduanya dihitung dari baris yang sama.
   */
  it('jumlah seluruh hari sama dengan jumlah baris sumbernya', () => {
    const sumber = [
      { tanggal: hari('2026-08-01'), total: 48000 },
      { tanggal: hari('2026-08-15'), total: 40000 },
      { tanggal: hari('2026-08-15'), total: 200000 },
      { tanggal: hari('2026-08-31'), total: 20000 },
    ];

    const total = rekapPerHari(sumber, 2026, 8).reduce(
      (j, h) => j + h.total,
      0,
    );

    expect(total).toBe(308000);
    expect(total).toBe(sumber.reduce((j, s) => j + s.total, 0));
  });

  it('mengabaikan baris di luar bulan yang diminta', () => {
    const hasil = rekapPerHari(
      [
        { tanggal: hari('2026-07-31'), total: 999 },
        { tanggal: hari('2026-09-01'), total: 999 },
        { tanggal: hari('2026-08-05'), total: 100 },
      ],
      2026,
      8,
    );

    expect(hasil.reduce((j, h) => j + h.total, 0)).toBe(100);
  });

  it('tidak tergeser oleh zona waktu Asia/Jakarta', () => {
    // Hari pertama dan terakhir paling rawan bergeser bila diformat lokal.
    const hasil = rekapPerHari(
      [
        { tanggal: hari('2026-08-01'), total: 10 },
        { tanggal: hari('2026-08-31'), total: 20 },
      ],
      2026,
      8,
    );

    expect(hasil[0]).toEqual({ tanggal: '2026-08-01', total: 10 });
    expect(hasil[30]).toEqual({ tanggal: '2026-08-31', total: 20 });
  });
});
