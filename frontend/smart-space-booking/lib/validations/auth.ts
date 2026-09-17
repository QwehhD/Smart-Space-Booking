import { z } from 'zod';

/**
 * Aturan validasi form autentikasi.
 *
 * Seluruh batasan disalin dari DTO backend di `backend/src/auth/dto/` agar
 * pengguna tidak perlu menunggu balasan server untuk kesalahan yang sudah pasti
 * ditolak. Backend tetap memeriksanya ulang; aturan di sini hanya mempercepat.
 *
 * Konfirmasi password dan persetujuan syarat hanya ada di frontend, karena
 * backend tidak menerima keduanya.
 */

const USERNAME_REGEX = /^[a-zA-Z0-9_.]+$/;
const TELP_REGEX = /^[0-9+\-\s]+$/;
const NAMA_BERKAS_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;

/** bcrypt hanya membaca 72 byte pertama, dan backend menolak yang lebih panjang. */
const PASSWORD_MAKS = 72;

const username = z
  .string()
  .min(3, 'Username minimal 3 karakter')
  .max(50, 'Username maksimal 50 karakter')
  .regex(USERNAME_REGEX, 'Username hanya boleh berisi huruf, angka, titik, dan garis bawah');

const password = z
  .string()
  .min(6, 'Password minimal 6 karakter')
  .max(PASSWORD_MAKS, `Password maksimal ${PASSWORD_MAKS} karakter`);

const telp = z
  .string()
  .min(8, 'Nomor telepon minimal 8 karakter')
  .max(20, 'Nomor telepon maksimal 20 karakter')
  .regex(TELP_REGEX, 'Nomor telepon hanya boleh berisi angka, spasi, +, dan -');

export const fotoOpsional = z
  .string()
  .max(255, 'Nama berkas foto maksimal 255 karakter')
  .regex(NAMA_BERKAS_REGEX, 'Nama berkas foto tidak valid')
  .optional();

export const skemaLogin = z.object({
  username: z.string().min(1, 'Username wajib diisi').max(50, 'Username maksimal 50 karakter'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .max(PASSWORD_MAKS, `Password maksimal ${PASSWORD_MAKS} karakter`),
});

export type NilaiLogin = z.infer<typeof skemaLogin>;

export const skemaRegisterMember = z
  .object({
    nama_member: z
      .string()
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    instansi: z
      .string()
      .min(2, 'Instansi minimal 2 karakter')
      .max(100, 'Instansi maksimal 100 karakter'),
    telp,
    alamat: z
      .string()
      .min(5, 'Alamat minimal 5 karakter')
      .max(255, 'Alamat maksimal 255 karakter'),
    username,
    password,
    konfirmasi_password: z.string().min(1, 'Konfirmasi password wajib diisi'),
    foto: fotoOpsional,
    setuju: z.literal(true, {
      message: 'Anda harus menyetujui Syarat & Ketentuan',
    }),
  })
  .refine((nilai) => nilai.password === nilai.konfirmasi_password, {
    path: ['konfirmasi_password'],
    message: 'Konfirmasi password tidak sama',
  });

export type NilaiRegisterMember = z.infer<typeof skemaRegisterMember>;

export const skemaRegisterAdmin = z
  .object({
    nama_coworking: z
      .string()
      .min(3, 'Nama coworking space minimal 3 karakter')
      .max(100, 'Nama coworking space maksimal 100 karakter'),
    nama_pemilik: z
      .string()
      .min(3, 'Nama pemilik minimal 3 karakter')
      .max(100, 'Nama pemilik maksimal 100 karakter'),
    telp,
    alamat: z.string().max(255, 'Alamat maksimal 255 karakter').optional(),
    deskripsi: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional(),
    username,
    password,
    konfirmasi_password: z.string().min(1, 'Konfirmasi password wajib diisi'),
    foto: fotoOpsional,
    setuju: z.literal(true, {
      message: 'Anda harus menyetujui Syarat & Ketentuan',
    }),
  })
  .refine((nilai) => nilai.password === nilai.konfirmasi_password, {
    path: ['konfirmasi_password'],
    message: 'Konfirmasi password tidak sama',
  });

export type NilaiRegisterAdmin = z.infer<typeof skemaRegisterAdmin>;
