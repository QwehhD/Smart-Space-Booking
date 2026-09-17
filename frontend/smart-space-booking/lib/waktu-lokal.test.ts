import { describe, expect, it } from 'vitest';
import { isoKeLokal, lokalKeIso, sedangBerlaku, sudahLewat } from '@/lib/waktu-lokal';

/**
 * Konversi masa berlaku promo antara input `datetime-local` dan ISO 8601.
 *
 * Inilah bagian yang paling mudah menggeser data diam-diam: input
 * `datetime-local` tidak mengenal zona waktu, sedangkan backend menyimpan waktu
 * penuh. Bila konversinya mengikuti zona peramban alih-alih WIB, jam yang
 * tersimpan akan berbeda dari yang diketik pengelola tanpa ada pesan kesalahan
 * apa pun.
 *
 * Pengujian ini berjalan dengan TZ=UTC (lihat `vitest.config.mts`) justru supaya
 * ketergantungan pada zona mesin akan ketahuan.
 */
describe('lokalKeIso', () => {
  it('membaca isian sebagai waktu WIB, bukan waktu mesin', () => {
    // 07:00 WIB sama dengan 00:00 UTC.
    expect(lokalKeIso('2026-01-01T07:00')).toBe('2026-01-01T00:00:00.000Z');
  });

  it('menggeser ke tanggal sebelumnya bila jamnya pagi buta', () => {
    // 05:00 WIB masih 22:00 UTC hari sebelumnya.
    expect(lokalKeIso('2026-06-16T05:00')).toBe('2026-06-15T22:00:00.000Z');
  });

  it('mengabaikan detik yang ikut terketik', () => {
    expect(lokalKeIso('2026-08-01T09:00:45')).toBe('2026-08-01T02:00:00.000Z');
  });
});

describe('isoKeLokal', () => {
  it('menampilkan waktu tersimpan dalam WIB', () => {
    expect(isoKeLokal('2026-01-01T00:00:00.000Z')).toBe('2026-01-01T07:00');
  });

  it('menggeser ke tanggal berikutnya bila melewati tengah malam WIB', () => {
    expect(isoKeLokal('2026-12-31T23:59:59.000Z')).toBe('2027-01-01T06:59');
  });
});

describe('bolak-balik lokal dan ISO', () => {
  /**
   * `datetime-local` tidak memiliki satuan detik, sehingga nilai yang tersimpan
   * pada detik ke-59 akan kembali sebagai detik ke-0. Karena itu yang dijaga
   * adalah keutuhan sampai satuan menit, bukan sampai detik.
   */
  it('utuh sampai satuan menit', () => {
    const kasus = [
      '2026-01-01T00:00:00.000Z',
      '2026-12-31T23:59:59.000Z',
      '2026-08-01T00:00:00.000Z',
      '2026-06-15T17:30:00.000Z',
      '2099-12-31T23:59:59.000Z',
    ];

    for (const iso of kasus) {
      const balik = lokalKeIso(isoKeLokal(iso));
      expect(balik.slice(0, 16)).toBe(iso.slice(0, 16));
    }
  });
});

describe('sedangBerlaku dan sudahLewat', () => {
  const setahunLalu = new Date(Date.now() - 365 * 864e5).toISOString();
  const setahunLagi = new Date(Date.now() + 365 * 864e5).toISOString();
  const duaTahunLalu = new Date(Date.now() - 730 * 864e5).toISOString();

  it('mengenali promo yang rentangnya mencakup sekarang', () => {
    expect(sedangBerlaku(setahunLalu, setahunLagi)).toBe(true);
  });

  it('menolak promo yang belum mulai', () => {
    expect(sedangBerlaku(setahunLagi, setahunLagi)).toBe(false);
  });

  it('menolak promo yang sudah berakhir', () => {
    expect(sedangBerlaku(duaTahunLalu, setahunLalu)).toBe(false);
  });

  it('menandai yang akhirnya sudah lewat', () => {
    expect(sudahLewat(setahunLalu)).toBe(true);
    expect(sudahLewat(setahunLagi)).toBe(false);
  });
});
