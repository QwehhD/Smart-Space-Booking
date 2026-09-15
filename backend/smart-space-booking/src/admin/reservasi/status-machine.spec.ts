import { StatusReservasi } from '@prisma/client';
import { bolehPindahStatus, PERPINDAHAN_STATUS } from './status-machine';

describe('mesin status reservasi', () => {
  it('mengikuti alur normal sebuah pemesanan', () => {
    expect(
      bolehPindahStatus(
        StatusReservasi.belum_dikonfirm,
        StatusReservasi.disetujui,
      ),
    ).toBe(true);
    expect(
      bolehPindahStatus(StatusReservasi.disetujui, StatusReservasi.aktif),
    ).toBe(true);
    expect(
      bolehPindahStatus(StatusReservasi.aktif, StatusReservasi.selesai),
    ).toBe(true);
  });

  it('tidak mengizinkan melompati konfirmasi', () => {
    expect(
      bolehPindahStatus(StatusReservasi.belum_dikonfirm, StatusReservasi.aktif),
    ).toBe(false);
    expect(
      bolehPindahStatus(
        StatusReservasi.belum_dikonfirm,
        StatusReservasi.selesai,
      ),
    ).toBe(false);
  });

  it('tidak mengizinkan mundur', () => {
    expect(
      bolehPindahStatus(StatusReservasi.aktif, StatusReservasi.disetujui),
    ).toBe(false);
    expect(
      bolehPindahStatus(
        StatusReservasi.disetujui,
        StatusReservasi.belum_dikonfirm,
      ),
    ).toBe(false);
  });

  it('memperlakukan selesai dan dibatalkan sebagai status akhir', () => {
    expect(PERPINDAHAN_STATUS[StatusReservasi.selesai]).toHaveLength(0);
    expect(PERPINDAHAN_STATUS[StatusReservasi.dibatalkan]).toHaveLength(0);

    for (const status of Object.values(StatusReservasi)) {
      expect(bolehPindahStatus(StatusReservasi.selesai, status)).toBe(false);
      expect(bolehPindahStatus(StatusReservasi.dibatalkan, status)).toBe(false);
    }
  });

  it('mengizinkan pembatalan selama sewanya belum berakhir', () => {
    for (const status of [
      StatusReservasi.belum_dikonfirm,
      StatusReservasi.disetujui,
      StatusReservasi.aktif,
    ]) {
      expect(bolehPindahStatus(status, StatusReservasi.dibatalkan)).toBe(true);
    }
  });

  it('menolak perpindahan ke status yang sama', () => {
    for (const status of Object.values(StatusReservasi)) {
      expect(bolehPindahStatus(status, status)).toBe(false);
    }
  });
});
