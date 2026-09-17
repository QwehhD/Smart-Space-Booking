import { ArrowLeft, Building2, Phone, Ticket } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { TombolBatal } from '@/components/member/tombol-batal';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error';
import { detailReservasi, eTicket } from '@/lib/api/reservasi';
import { sesiServer } from '@/lib/auth/server';
import { bolehDibatalkanMember, punyaETicket } from '@/lib/constants';
import { tanggalDenganHari } from '@/lib/format';

export const metadata = { title: 'Detail Reservasi' };
export const dynamic = 'force-dynamic';

const ambil = cache(async (id: number, token?: string) => {
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  try {
    return await detailReservasi(id, token);
  } catch (error) {
    if (error instanceof ApiError && (error.tidakDitemukan || error.tidakBerhak)) {
      return null;
    }

    throw error;
  }
});

/**
 * Detail satu pemesanan.
 *
 * `GET /api/reservasi/{id}` tidak memuat data pengelola maupun rincian potongan
 * harga, sedangkan e-ticket memuat keduanya. Karena itu keduanya digabung di
 * sini, dan pengambilan e-ticket dibuat bersifat pelengkap: bila gagal, halaman
 * tetap tampil dengan data yang ada.
 */
export default async function DetailReservasiPage({
  params,
}: PageProps<'/reservasi/[id]'>) {
  const { id } = await params;
  const { token } = await sesiServer();

  const reservasi = await ambil(Number(id), token);

  if (!reservasi) {
    notFound();
  }

  const tiket = await eTicket(reservasi.id, token).catch(() => null);
  const rincian = tiket?.rincian_pembayaran;

  return (
    <div className="grid gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        render={
          <Link href="/reservasi">
            <ArrowLeft />
            Kembali ke daftar
          </Link>
        }
      />

      <PageHeader judul="Detail Reservasi" />

      <div className="bg-card grid gap-4 rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs">Kode booking</p>
            <p className="font-mono text-lg font-semibold tracking-wide">
              {reservasi.kode_booking}
            </p>
          </div>
          <StatusBadge status={reservasi.status} />
        </div>

        <dl className="grid gap-2.5 border-t pt-4 text-sm">
          <Baris label="Space" nilai={reservasi.space?.nama_space ?? '—'} />
          <Baris label="Tanggal" nilai={tanggalDenganHari(reservasi.tanggal_reservasi)} />
          <Baris
            label="Jam"
            nilai={`${reservasi.jam_mulai}–${reservasi.jam_selesai} (${reservasi.durasi_jam} jam)`}
          />
          <Baris label="Atas nama" nilai={reservasi.member.nama_member} />
          <Baris label="No. telepon" nilai={reservasi.member.telp} />
        </dl>
      </div>

      <section className="bg-card grid gap-3 rounded-lg border p-5">
        <h2 className="font-semibold">Rincian pembayaran</h2>
        <dl className="grid gap-2 text-sm">
          {rincian ? (
            <>
              <Baris
                label="Tarif"
                nilai={<Rupiah nilai={rincian.tarif_kotor} />}
              />
              {rincian.diskon_promo ? (
                <Baris
                  label={`Diskon ${rincian.diskon_promo}`}
                  nilai={
                    <span className="text-status-berhasil tabular-nums">
                      &minus;<Rupiah nilai={rincian.potongan} />
                    </span>
                  }
                />
              ) : null}
            </>
          ) : null}
          <div className="flex items-center justify-between gap-4 border-t pt-2 text-base font-semibold">
            <dt>Total bayar</dt>
            <dd>
              <Rupiah nilai={reservasi.total_bayar} />
            </dd>
          </div>
        </dl>
      </section>

      {tiket ? (
        <section className="bg-card grid gap-2 rounded-lg border p-5">
          <h2 className="font-semibold">Lokasi</h2>
          <p className="flex items-center gap-1.5 text-sm">
            <Building2 className="text-muted-foreground size-3.5 shrink-0" />
            {tiket.coworking_space.nama}
          </p>
          <p className="flex items-center gap-1.5 text-sm">
            <Phone className="text-muted-foreground size-3.5 shrink-0" />
            <a href={`tel:${tiket.coworking_space.telepon}`} className="hover:underline">
              {tiket.coworking_space.telepon}
            </a>
          </p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {punyaETicket(reservasi.status) ? (
          <Button
            render={
              <Link href={`/tiket/${reservasi.id}`}>
                <Ticket />
                Lihat e-ticket
              </Link>
            }
          />
        ) : null}

        {bolehDibatalkanMember(reservasi.status) ? (
          <TombolBatal id={reservasi.id} kodeBooking={reservasi.kode_booking} />
        ) : null}
      </div>
    </div>
  );
}

function Baris({
  label,
  nilai,
}: {
  label: string;
  nilai: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right">{nilai}</dd>
    </div>
  );
}
