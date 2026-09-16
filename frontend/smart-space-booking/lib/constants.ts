import type { Role, StatusReservasi, TipeSpace } from '@/types/entities';

/**
 * Label dan aturan yang harus sama persis dengan backend.
 *
 * Transisi status disalin dari `backend/src/admin/reservasi/status-machine.ts`
 * dan status yang boleh dibatalkan member dari
 * `backend/src/reservasi/reservasi.constant.ts`. Keduanya dipakai untuk
 * menampilkan tombol aksi yang valid saja; keputusan sebenarnya tetap di backend,
 * jadi salinan ini hanya menentukan apa yang terlihat, bukan apa yang boleh.
 */

/* ---------- status reservasi ---------- */

export const LABEL_STATUS: Record<StatusReservasi, string> = {
  belum_dikonfirm: 'Belum Dikonfirmasi',
  disetujui: 'Disetujui',
  aktif: 'Aktif',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

/** Nama token warna, bukan kelas Tailwind, agar dipakai seragam di semua badge. */
export const WARNA_STATUS: Record<StatusReservasi, string> = {
  belum_dikonfirm: 'menunggu',
  disetujui: 'berhasil',
  aktif: 'berjalan',
  selesai: 'netral',
  dibatalkan: 'gagal',
};

export const URUTAN_STATUS: StatusReservasi[] = [
  'belum_dikonfirm',
  'disetujui',
  'aktif',
  'selesai',
  'dibatalkan',
];

/** Perpindahan status yang diterima backend. Status akhir tidak punya tujuan. */
export const TRANSISI_STATUS: Record<StatusReservasi, StatusReservasi[]> = {
  belum_dikonfirm: ['disetujui', 'dibatalkan'],
  disetujui: ['aktif', 'selesai', 'dibatalkan'],
  aktif: ['selesai', 'dibatalkan'],
  selesai: [],
  dibatalkan: [],
};

export function bolehPindahStatus(
  dari: StatusReservasi,
  ke: StatusReservasi,
): boolean {
  return TRANSISI_STATUS[dari].includes(ke);
}

/** Status yang masih boleh dibatalkan member sendiri. */
export const STATUS_BOLEH_DIBATALKAN: StatusReservasi[] = [
  'belum_dikonfirm',
  'disetujui',
];

export function bolehDibatalkanMember(status: StatusReservasi): boolean {
  return STATUS_BOLEH_DIBATALKAN.includes(status);
}

/**
 * Check-in hanya untuk reservasi yang sudah disetujui, check-out hanya untuk
 * yang sedang aktif. Backend memeriksanya sendiri di luar mesin status.
 */
export function bolehCheckIn(status: StatusReservasi): boolean {
  return status === 'disetujui';
}

export function bolehCheckOut(status: StatusReservasi): boolean {
  return status === 'aktif';
}

/**
 * E-ticket dapat dibuka untuk status apa pun di backend, tetapi tiket reservasi
 * yang sudah dibatalkan tidak ada gunanya ditunjukkan di lokasi, jadi
 * disembunyikan dari daftar tiket.
 */
export function punyaETicket(status: StatusReservasi): boolean {
  return status !== 'dibatalkan';
}

/* ---------- tipe space ---------- */

export const LABEL_TIPE: Record<TipeSpace, string> = {
  desk: 'Personal Desk',
  meeting_room: 'Meeting Room',
  private_office: 'Private Office',
};

export const URUTAN_TIPE: TipeSpace[] = ['desk', 'meeting_room', 'private_office'];

/* ---------- role ---------- */

export const LABEL_ROLE: Record<Role, string> = {
  member: 'Member',
  admin_space: 'Admin Space',
};

/** Beranda masing-masing role, dipakai proxy dan pengalihan setelah login. */
export const BERANDA_ROLE: Record<Role, string> = {
  member: '/spaces',
  admin_space: '/admin/dashboard',
};

export const HALAMAN_LOGIN: Record<Role, string> = {
  member: '/login',
  admin_space: '/admin/login',
};

/* ---------- jam operasional ---------- */

/**
 * Harus sama dengan env backend. Dipakai untuk membatasi pilihan jam pada form,
 * sedangkan penolakan sebenarnya tetap dilakukan backend.
 */
export const JAM_BUKA = process.env.NEXT_PUBLIC_JAM_BUKA ?? '07:00';
export const JAM_TUTUP = process.env.NEXT_PUBLIC_JAM_TUTUP ?? '22:00';

/** Nama cookie sesi. Dibaca proxy dan Server Component. */
export const COOKIE_TOKEN = 'ssb_token';
export const COOKIE_ROLE = 'ssb_role';
