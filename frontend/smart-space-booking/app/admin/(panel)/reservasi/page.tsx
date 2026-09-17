import { DaftarReservasiAdmin } from '@/components/admin/daftar-reservasi-admin';
import { PageHeader } from '@/components/layout/page-header';
import {
  daftarReservasiAdmin,
  type FilterReservasiAdmin,
} from '@/lib/api/admin-reservasi';
import { daftarSpaceAdmin } from '@/lib/api/admin-spaces';
import { sesiServer } from '@/lib/auth/server';
import { URUTAN_STATUS } from '@/lib/constants';
import type { StatusReservasi } from '@/types/entities';

export const metadata = { title: 'Semua Reservasi' };
export const dynamic = 'force-dynamic';

/** Membaca satu nilai dari searchParams, yang dapat berupa array. */
function satu(nilai: string | string[] | undefined): string | undefined {
  return typeof nilai === 'string' ? nilai : undefined;
}

/**
 * Daftar pemesanan beserta pengelolaan statusnya.
 *
 * Filter status dan space dibaca dari URL lalu diteruskan ke backend, sehingga
 * tampilan tertentu dapat ditautkan. Tanpa filter tanggal, backend mengembalikan
 * seluruh pemesanan milik pengelola ini, bukan hanya bulan berjalan.
 */
export default async function ReservasiAdminPage({
  searchParams,
}: PageProps<'/admin/reservasi'>) {
  const { token } = await sesiServer();
  const sp = await searchParams;

  const statusMentah = satu(sp.status);
  const idSpaceMentah = Number(satu(sp.id_space));

  const filter: FilterReservasiAdmin = {
    // Nilai yang tidak dikenal diabaikan, bukan diteruskan, supaya salah ketik
    // pada URL tidak berujung 400 dari backend.
    ...(URUTAN_STATUS.includes(statusMentah as StatusReservasi)
      ? { status: statusMentah as StatusReservasi }
      : {}),
    ...(Number.isInteger(idSpaceMentah) && idSpaceMentah > 0
      ? { id_space: idSpaceMentah }
      : {}),
  };

  const [daftar, spaces] = await Promise.all([
    daftarReservasiAdmin(filter, token),
    daftarSpaceAdmin(token),
  ]);

  return (
    <div className="grid gap-6">
      <PageHeader
        judul="Semua Reservasi"
        keterangan="Setujui, batalkan, dan catat kedatangan tamu."
      />

      <DaftarReservasiAdmin
        awal={daftar}
        filter={filter}
        spaces={spaces}
        kodeAwal={satu(sp.kode) ?? ''}
      />
    </div>
  );
}
