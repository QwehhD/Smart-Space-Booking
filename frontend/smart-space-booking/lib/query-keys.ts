import type { FilterReservasiAdmin } from '@/lib/api/admin-reservasi';
import type { FilterSpace } from '@/lib/api/spaces';

/**
 * Kunci cache TanStack Query, terpusat supaya invalidasi setelah mutasi tidak
 * pernah meleset karena salah ketik.
 *
 * Susunannya berjenjang: kunci induk selalu menjadi awalan kunci anaknya,
 * sehingga `invalidateQueries({ queryKey: qk.reservasi.all })` ikut membatalkan
 * seluruh daftar dan detail di bawahnya.
 */
export const qk = {
  profil: ['profil'] as const,

  spaces: {
    all: ['spaces'] as const,
    list: (filter: FilterSpace) => ['spaces', 'list', filter] as const,
    detail: (id: number) => ['spaces', 'detail', id] as const,
    tipe: ['spaces', 'tipe'] as const,
    ketersediaan: (
      idSpace: number,
      tanggal: string,
      jamMulai: string,
      durasi: number,
    ) => ['spaces', 'ketersediaan', idSpace, tanggal, jamMulai, durasi] as const,
  },

  diskon: {
    all: ['diskon'] as const,
    aktif: (idSpace?: number) => ['diskon', 'aktif', idSpace ?? null] as const,
    detail: (id: number) => ['diskon', 'detail', id] as const,
  },

  reservasi: {
    all: ['reservasi'] as const,
    milikSaya: ['reservasi', 'milik-saya'] as const,
    histori: (month: number, year: number) =>
      ['reservasi', 'histori', month, year] as const,
    detail: (id: number) => ['reservasi', 'detail', id] as const,
    eTicket: (id: number) => ['reservasi', 'e-ticket', id] as const,
  },

  admin: {
    profil: ['admin', 'profil'] as const,

    spaces: {
      all: ['admin', 'spaces'] as const,
      detail: (id: number) => ['admin', 'spaces', 'detail', id] as const,
    },

    diskon: {
      all: ['admin', 'diskon'] as const,
      detail: (id: number) => ['admin', 'diskon', 'detail', id] as const,
    },

    members: {
      all: ['admin', 'members'] as const,
      list: (search?: string) => ['admin', 'members', 'list', search ?? ''] as const,
      detail: (id: number) => ['admin', 'members', 'detail', id] as const,
    },

    reservasi: {
      all: ['admin', 'reservasi'] as const,
      list: (filter: FilterReservasiAdmin) =>
        ['admin', 'reservasi', 'list', filter] as const,
    },

    laporan: {
      all: ['admin', 'laporan'] as const,
      bulanan: (month: number, year: number) =>
        ['admin', 'laporan', 'bulanan', month, year] as const,
    },
  },
} as const;

/**
 * Kunci yang perlu dibatalkan setelah status sebuah reservasi berubah.
 *
 * Perubahan status menyentuh banyak tampilan sekaligus: detailnya, daftar milik
 * member, daftar pada panel admin, dan angka pada dashboard serta laporan.
 * Dikumpulkan di sini agar setiap aksi tidak perlu mengingat-ingat daftarnya.
 */
export function kunciTerdampakStatus(idReservasi: number) {
  return [
    qk.reservasi.detail(idReservasi),
    qk.reservasi.eTicket(idReservasi),
    qk.reservasi.milikSaya,
    qk.admin.reservasi.all,
    qk.admin.laporan.all,
  ];
}
