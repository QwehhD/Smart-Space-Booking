import { describe, expect, it, vi } from 'vitest';
import { ApiError, applyFieldErrors } from '@/lib/api/error';

/**
 * Penempelan pesan kesalahan backend ke input yang tepat.
 *
 * Nama field dari backend berupa teks biasa, sehingga daftar `fieldDikenal`
 * berfungsi sebagai penyaring sekaligus bukti bahwa nama itu memang milik form
 * yang bersangkutan. Tanpa penyaringan itu, nama field asing akan diteruskan ke
 * react-hook-form dan pesannya hilang tanpa jejak.
 */
const FIELD = ['nama_coworking', 'telp', 'alamat'] as const;

function galat(
  fieldErrors: { field: string; messages: string[] }[],
  pesan = 'Validasi gagal',
) {
  return new ApiError(pesan, 400, fieldErrors);
}

describe('applyFieldErrors', () => {
  it('memasang pesan pada field yang dikenal', () => {
    const setError = vi.fn();
    const terpasang = applyFieldErrors(
      galat([{ field: 'telp', messages: ['Nomor telepon tidak valid'] }]),
      setError,
      FIELD,
    );

    expect(terpasang).toBe(true);
    expect(setError).toHaveBeenCalledWith('telp', {
      type: 'server',
      message: 'Nomor telepon tidak valid',
    });
  });

  it('mengabaikan field yang tidak ada pada form itu', () => {
    const setError = vi.fn();
    const terpasang = applyFieldErrors(
      galat([{ field: 'username', messages: ['Username sudah dipakai'] }]),
      setError,
      FIELD,
    );

    expect(terpasang).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it('memasang yang dikenal dan melewati yang tidak, dalam satu response', () => {
    const setError = vi.fn();
    const terpasang = applyFieldErrors(
      galat([
        { field: 'username', messages: ['Tidak relevan'] },
        { field: 'alamat', messages: ['Alamat minimal 3 karakter'] },
      ]),
      setError,
      FIELD,
    );

    expect(terpasang).toBe(true);
    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('alamat', expect.anything());
  });

  /** Hanya pesan pertama yang ditampilkan; sisanya akan menumpuk di satu baris. */
  it('memakai pesan pertama saja bila ada beberapa', () => {
    const setError = vi.fn();
    applyFieldErrors(
      galat([{ field: 'telp', messages: ['Pesan pertama', 'Pesan kedua'] }]),
      setError,
      FIELD,
    );

    expect(setError).toHaveBeenCalledWith('telp', {
      type: 'server',
      message: 'Pesan pertama',
    });
  });

  it('mengembalikan false untuk kesalahan tanpa rincian field', () => {
    const setError = vi.fn();

    expect(applyFieldErrors(galat([]), setError, FIELD)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });

  it('mengembalikan false untuk kesalahan yang bukan dari API', () => {
    const setError = vi.fn();

    expect(applyFieldErrors(new Error('jaringan putus'), setError, FIELD)).toBe(
      false,
    );
    expect(applyFieldErrors(undefined, setError, FIELD)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});

describe('ApiError', () => {
  it('menyimpan pesan dan status dari backend', () => {
    const e = new ApiError('Kode promo tidak berlaku untuk space ini', 400, []);

    expect(e).toBeInstanceOf(Error);
    expect(e.message).toBe('Kode promo tidak berlaku untuk space ini');
    expect(e.statusCode).toBe(400);
  });

  it('menandai 404 sebagai tidak ditemukan', () => {
    expect(new ApiError('Tidak ditemukan', 404, []).tidakDitemukan).toBe(true);
    expect(new ApiError('Gagal', 400, []).tidakDitemukan).toBe(false);
  });
});
