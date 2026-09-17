import { describe, expect, it } from 'vitest';
import {
  bolehCheckIn,
  bolehCheckOut,
  bolehDibatalkanMember,
  bolehPindahStatus,
  LABEL_STATUS,
  LABEL_TIPE,
  punyaETicket,
  TRANSISI_STATUS,
  URUTAN_STATUS,
  URUTAN_TIPE,
} from '@/lib/constants';
import type { StatusReservasi } from '@/types/entities';

/**
 * Salinan mesin status backend.
 *
 * Isinya disalin dari `backend/src/admin/reservasi/status-machine.ts` dan dipakai
 * menentukan tombol aksi mana yang ditampilkan. Bila salinan ini melenceng,
 * pengelola akan disodori tombol yang pasti ditolak backend, atau kehilangan
 * tombol yang sebenarnya boleh ia pakai. Pengujian ini mengunci bentuknya.
 */
describe('TRANSISI_STATUS', () => {
  it('memuat kelima status tanpa kurang atau lebih', () => {
    expect(Object.keys(TRANSISI_STATUS).sort()).toEqual([...URUTAN_STATUS].sort());
  });

  it('cocok dengan tabel perpindahan di backend', () => {
    expect(TRANSISI_STATUS).toEqual({
      belum_dikonfirm: ['disetujui', 'dibatalkan'],
      disetujui: ['aktif', 'selesai', 'dibatalkan'],
      aktif: ['selesai', 'dibatalkan'],
      selesai: [],
      dibatalkan: [],
    });
  });

  it('menjadikan selesai dan dibatalkan sebagai status akhir', () => {
    expect(TRANSISI_STATUS.selesai).toHaveLength(0);
    expect(TRANSISI_STATUS.dibatalkan).toHaveLength(0);
  });

  it('tidak pernah menawarkan perpindahan ke status yang sama', () => {
    for (const status of URUTAN_STATUS) {
      expect(TRANSISI_STATUS[status]).not.toContain(status);
    }
  });

  it('hanya menunjuk status yang dikenal', () => {
    for (const tujuan of Object.values(TRANSISI_STATUS).flat()) {
      expect(URUTAN_STATUS).toContain(tujuan);
    }
  });
});

describe('bolehPindahStatus', () => {
  it('mengizinkan persetujuan dari belum dikonfirmasi', () => {
    expect(bolehPindahStatus('belum_dikonfirm', 'disetujui')).toBe(true);
  });

  it('menolak menghidupkan kembali reservasi yang sudah selesai', () => {
    expect(bolehPindahStatus('selesai', 'disetujui')).toBe(false);
  });

  it('menolak melompati persetujuan', () => {
    expect(bolehPindahStatus('belum_dikonfirm', 'aktif')).toBe(false);
  });
});

describe('bolehCheckIn dan bolehCheckOut', () => {
  it('check-in hanya untuk yang sudah disetujui', () => {
    for (const status of URUTAN_STATUS) {
      expect(bolehCheckIn(status)).toBe(status === 'disetujui');
    }
  });

  it('check-out hanya untuk yang sedang aktif', () => {
    for (const status of URUTAN_STATUS) {
      expect(bolehCheckOut(status)).toBe(status === 'aktif');
    }
  });

  /**
   * Tombol check-in dan check-out tidak pernah muncul bersamaan, karena syarat
   * keduanya saling meniadakan.
   */
  it('tidak pernah berlaku bersamaan', () => {
    for (const status of URUTAN_STATUS) {
      expect(bolehCheckIn(status) && bolehCheckOut(status)).toBe(false);
    }
  });
});

describe('bolehDibatalkanMember', () => {
  it('hanya untuk pemesanan yang belum berjalan', () => {
    const boleh: StatusReservasi[] = ['belum_dikonfirm', 'disetujui'];

    for (const status of URUTAN_STATUS) {
      expect(bolehDibatalkanMember(status)).toBe(boleh.includes(status));
    }
  });

  /** Yang boleh dibatalkan member harus juga sah menurut mesin status. */
  it('selalu merupakan perpindahan yang diizinkan', () => {
    for (const status of URUTAN_STATUS) {
      if (bolehDibatalkanMember(status)) {
        expect(bolehPindahStatus(status, 'dibatalkan')).toBe(true);
      }
    }
  });
});

describe('punyaETicket', () => {
  it('berlaku untuk semua status kecuali dibatalkan', () => {
    for (const status of URUTAN_STATUS) {
      expect(punyaETicket(status)).toBe(status !== 'dibatalkan');
    }
  });
});

describe('label', () => {
  it('menyediakan label untuk setiap status', () => {
    for (const status of URUTAN_STATUS) {
      expect(LABEL_STATUS[status]).toBeTruthy();
    }
  });

  it('menyediakan label untuk setiap tipe space', () => {
    for (const tipe of URUTAN_TIPE) {
      expect(LABEL_TIPE[tipe]).toBeTruthy();
    }
  });

  it('memuat ketiga tipe space yang dikenal backend', () => {
    expect([...URUTAN_TIPE].sort()).toEqual([
      'desk',
      'meeting_room',
      'private_office',
    ]);
  });
});
