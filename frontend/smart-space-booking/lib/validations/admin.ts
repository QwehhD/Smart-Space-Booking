import { z } from 'zod';
import { fotoOpsional } from '@/lib/validations/auth';

/**
 * Aturan validasi form pada panel pengelola.
 *
 * Seluruh batasan disalin dari DTO backend di dalam `backend/src/admin/`.
 * Perhatikan bahwa field opsional di backend tetap memiliki panjang minimum bila
 * diisi, misalnya `alamat` minimal 3 karakter. Teks kosong karena itu tidak boleh
 * dikirim sebagai string kosong, melainkan tidak dikirim sama sekali.
 *
 * Kekosongan itu diperlakukan sebagai sah di sini, lalu field yang kosong
 * disaring saat menyusun payload. Pendekatan ini dipilih daripada `z.preprocess`
 * yang mengubah tipe masukan menjadi `unknown` sehingga resolver tidak lagi
 * cocok dengan tipe form react-hook-form.
 */

const TELP_REGEX = /^[0-9+\-\s]+$/;

/** Boleh kosong, tetapi bila diisi harus memenuhi panjang minimum backend. */
function teksOpsional(min: number, maks: number, label: string) {
  return z
    .string()
    .max(maks, `${label} maksimal ${maks} karakter`)
    .refine((nilai) => nilai === '' || nilai.trim().length >= min, {
      message: `${label} minimal ${min} karakter`,
    });
}

export const skemaProfilLokasi = z.object({
  nama_coworking: z
    .string()
    .min(3, 'Nama coworking space minimal 3 karakter')
    .max(100, 'Nama coworking space maksimal 100 karakter'),
  nama_pemilik: z
    .string()
    .min(3, 'Nama pemilik minimal 3 karakter')
    .max(100, 'Nama pemilik maksimal 100 karakter'),
  telp: z
    .string()
    .min(8, 'Nomor telepon minimal 8 karakter')
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(TELP_REGEX, 'Nomor telepon hanya boleh berisi angka, spasi, +, dan -'),
  alamat: teksOpsional(3, 255, 'Alamat'),
  deskripsi: teksOpsional(3, 1000, 'Deskripsi'),
  foto: fotoOpsional,
});

export type NilaiProfilLokasi = z.infer<typeof skemaProfilLokasi>;

/* ---------- space ---------- */

/** Batas atas mengikuti CreateSpaceDto; sekadar penjaga salah ketik. */
const HARGA_MAKSIMAL = 100_000_000;
const KAPASITAS_MAKSIMAL = 1000;

export const skemaSpace = z.object({
  nama_space: z
    .string()
    .min(3, 'Nama space minimal 3 karakter')
    .max(100, 'Nama space maksimal 100 karakter'),
  harga_per_jam: z
    .number({ message: 'Harga per jam wajib diisi' })
    .int('Harga per jam harus berupa bilangan bulat')
    .min(0, 'Harga per jam tidak boleh negatif')
    .max(HARGA_MAKSIMAL, 'Harga per jam melebihi batas wajar'),
  tipe: z.enum(['desk', 'meeting_room', 'private_office'], {
    message: 'Tipe space wajib dipilih',
  }),
  kapasitas: z
    .number({ message: 'Kapasitas wajib diisi' })
    .int('Kapasitas harus berupa bilangan bulat')
    .min(1, 'Kapasitas minimal 1 orang')
    .max(KAPASITAS_MAKSIMAL, 'Kapasitas melebihi batas wajar'),
  deskripsi: z
    .string()
    .min(3, 'Deskripsi minimal 3 karakter')
    .max(1000, 'Deskripsi maksimal 1000 karakter'),
  foto: fotoOpsional,
});

export type NilaiSpace = z.infer<typeof skemaSpace>;

/* ---------- diskon ---------- */

const KODE_PROMO_REGEX = /^[A-Z0-9]+$/;

/**
 * Tanggal diisi lewat input `datetime-local`, yang bentuknya `YYYY-MM-DDTHH:mm`
 * tanpa zona. Nilai itu dikonversi ke ISO 8601 WIB sebelum dikirim, karena
 * backend mengharapkan waktu penuh.
 */
export const skemaDiskon = z
  .object({
    nama_diskon: z
      .string()
      .min(3, 'Kode promo minimal 3 karakter')
      .max(100, 'Kode promo maksimal 100 karakter')
      .regex(
        KODE_PROMO_REGEX,
        'Kode promo hanya boleh berisi huruf kapital dan angka, tanpa spasi',
      ),
    persentase_diskon: z
      .number({ message: 'Persentase diskon wajib diisi' })
      .int('Persentase diskon harus berupa bilangan bulat')
      .min(1, 'Persentase diskon minimal 1 persen')
      .max(100, 'Persentase diskon maksimal 100 persen'),
    tanggal_awal: z.string().min(1, 'Tanggal awal wajib diisi'),
    tanggal_akhir: z.string().min(1, 'Tanggal akhir wajib diisi'),
  })
  .refine((nilai) => nilai.tanggal_akhir > nilai.tanggal_awal, {
    path: ['tanggal_akhir'],
    message: 'Tanggal akhir harus setelah tanggal awal',
  });

export type NilaiDiskon = z.infer<typeof skemaDiskon>;

/* ---------- member ---------- */

const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
const PASSWORD_MAKS = 72;

const dataDiriMember = {
  nama_member: z
    .string()
    .min(3, 'Nama member minimal 3 karakter')
    .max(100, 'Nama member maksimal 100 karakter'),
  instansi: z
    .string()
    .min(2, 'Instansi minimal 2 karakter')
    .max(100, 'Instansi maksimal 100 karakter'),
  alamat: z
    .string()
    .min(5, 'Alamat minimal 5 karakter')
    .max(255, 'Alamat maksimal 255 karakter'),
  telp: z
    .string()
    .min(8, 'Nomor telepon minimal 8 karakter')
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .regex(TELP_REGEX, 'Nomor telepon hanya boleh berisi angka, spasi, +, dan -'),
  foto: fotoOpsional,
};

export const skemaMemberBaru = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(
      USERNAME_REGEX,
      'Username hanya boleh berisi huruf, angka, titik, dan garis bawah',
    ),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(PASSWORD_MAKS, `Password maksimal ${PASSWORD_MAKS} karakter`),
  ...dataDiriMember,
});

export type NilaiMemberBaru = z.infer<typeof skemaMemberBaru>;

/**
 * Username tidak dapat diubah, dan password bersifat opsional: bila dikosongkan
 * kata sandi member dibiarkan, bila diisi backend memperlakukannya sebagai reset.
 */
export const skemaMemberUbah = z.object({
  password: z
    .string()
    .max(PASSWORD_MAKS, `Password maksimal ${PASSWORD_MAKS} karakter`)
    .refine((nilai) => nilai === '' || nilai.length >= 6, {
      message: 'Password minimal 6 karakter',
    }),
  ...dataDiriMember,
});

export type NilaiMemberUbah = z.infer<typeof skemaMemberUbah>;
