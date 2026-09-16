import { dateUtcKeTanggal } from '../../common/utils/waktu.util';

export interface EntriHarian {
  tanggal: string;
  total: number;
}

/** Satu baris yang ikut dihitung: tanggal sewanya dan nilai yang masuk. */
export interface SumberHarian {
  tanggal: Date;
  total: number;
}

/**
 * Menjumlahkan pendapatan per hari untuk satu bulan penuh.
 *
 * Seluruh hari dalam bulan tersebut selalu muncul, termasuk yang tidak ada
 * transaksinya, supaya grafik pada frontend memiliki sumbu yang utuh dan tidak
 * berubah bentuk dari bulan ke bulan.
 *
 * Fungsi ini sengaja murni dan menerima baris yang sudah disaring pemanggilnya,
 * sehingga hasil penjumlahannya pasti sama dengan total laporan: keduanya
 * dihitung dari kumpulan baris yang sama persis.
 *
 * Tanggal dibaca dan ditulis lewat komponen UTC, karena kolomnya bertipe DATE
 * sedangkan aplikasi berjalan pada zona Asia/Jakarta.
 */
export function rekapPerHari(
  sumber: ReadonlyArray<SumberHarian>,
  year: number,
  month: number,
): EntriHarian[] {
  // Hari ke-0 bulan berikutnya adalah hari terakhir bulan ini.
  const jumlahHari = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const perTanggal = new Map<string, number>();

  for (let hari = 1; hari <= jumlahHari; hari += 1) {
    perTanggal.set(
      dateUtcKeTanggal(new Date(Date.UTC(year, month - 1, hari))),
      0,
    );
  }

  for (const baris of sumber) {
    const kunci = dateUtcKeTanggal(baris.tanggal);
    const sekarang = perTanggal.get(kunci);

    // Baris di luar bulan yang diminta diabaikan, bukan diam-diam ditambahkan
    // ke hari lain, agar jumlahnya tidak pernah melebihi total laporan.
    if (sekarang !== undefined) {
      perTanggal.set(kunci, sekarang + baris.total);
    }
  }

  return [...perTanggal.entries()].map(([tanggal, total]) => ({
    tanggal,
    total,
  }));
}
