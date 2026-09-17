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
