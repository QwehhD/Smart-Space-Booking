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
 * Filter status, space, dan bulan dibaca dari URL lalu diteruskan ke backend,
 * sehingga tampilan tertentu dapat ditautkan. Tanpa filter bulan, backend
 * mengembalikan seluruh pemesanan milik pengelola ini, bukan hanya bulan
 * berjalan — itulah bawaannya di sini.
 */
export default async function ReservasiAdminPage({
  searchParams,
}: PageProps<'/admin/reservasi'>) {
  const { token } = await sesiServer();
  const sp = await searchParams;

  const statusMentah = satu(sp.status);
  const idSpaceMentah = Number(satu(sp.id_space));
  const bulanMentah = Number(satu(sp.month));
  const tahunMentah = Number(satu(sp.year));

  // Bulan hanya diteruskan bila tahunnya juga sah; backend menolak salah satunya
  // saja, dan tanpa keduanya ia mengembalikan seluruh pemesanan.
  const punyaBulan =
    Number.isInteger(bulanMentah) &&
    bulanMentah >= 1 &&
    bulanMentah <= 12 &&
    Number.isInteger(tahunMentah) &&
    tahunMentah >= 2000 &&
    tahunMentah <= 2100;

  const filter: FilterReservasiAdmin = {
    // Nilai yang tidak dikenal diabaikan, bukan diteruskan, supaya salah ketik
    // pada URL tidak berujung 400 dari backend.
    ...(URUTAN_STATUS.includes(statusMentah as StatusReservasi)
      ? { status: statusMentah as StatusReservasi }
      : {}),
    ...(Number.isInteger(idSpaceMentah) && idSpaceMentah > 0
      ? { id_space: idSpaceMentah }
      : {}),
    ...(punyaBulan ? { month: bulanMentah, year: tahunMentah } : {}),
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
