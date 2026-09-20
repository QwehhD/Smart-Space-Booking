import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AksiTiket } from '@/components/member/aksi-tiket';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error';
import { eTicket } from '@/lib/api/reservasi';
import { sesiServer } from '@/lib/auth/server';
import { tanggalDenganHari } from '@/lib/format';

export const metadata = { title: 'E-Ticket' };
export const dynamic = 'force-dynamic';

/**
 * Nota digital satu reservasi.
 *
 * Seluruh isinya berasal dari `GET /api/reservasi/{id}/e-ticket`, termasuk nomor
 * tiket, rincian pembayaran, dan gambar QR yang sudah dibentuk backend sebagai
 * data URI. Tidak ada angka yang dihitung ulang di sini.
 */
export default async function ETicketPage({ params }: PageProps<'/tiket/[id]'>) {
  const { id } = await params;
  const idAngka = Number(id);

  if (!Number.isInteger(idAngka) || idAngka < 1) {
    notFound();
  }

  const { token } = await sesiServer();

  let tiket;

  try {
    tiket = await eTicket(idAngka, token);
  } catch (error) {
    if (error instanceof ApiError && (error.tidakDitemukan || error.tidakBerhak)) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="grid gap-5">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit print:hidden"
        render={
          <Link href="/tiket">
            <ArrowLeft />
            Kembali ke daftar tiket
          </Link>
        }
      />

      <article className="cetak-tiket bg-card shadow-xs mx-auto w-full max-w-md overflow-hidden rounded-xl border">
        <header className="border-b px-5 py-4 text-center">
          <p className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
            E-Ticket Reservasi
          </p>
          <h1 className="mt-1 text-lg font-semibold text-balance">
            {tiket.coworking_space.nama}
          </h1>
          <p className="text-muted-foreground text-sm">
            {tiket.coworking_space.telepon}
          </p>
        </header>

        <div className="grid justify-items-center gap-3 border-b px-5 py-5">
          {/* Gambar QR sudah berupa data URI dari backend. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tiket.qr_code_data_url}
            alt={`QR code untuk ${tiket.kode_booking}`}
            width={180}
            height={180}
            className="rounded-md border bg-white p-2"
          />
          <div className="text-center">
            <p className="font-mono text-lg font-semibold tracking-wide">
              {tiket.kode_booking}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              {tiket.e_ticket_number}
            </p>
          </div>
          <StatusBadge status={tiket.status_reservasi} />
        </div>

        <dl className="grid gap-2.5 border-b px-5 py-4 text-sm">
          <Baris label="Nama" nilai={tiket.member.nama} />
          <Baris label="Instansi" nilai={tiket.member.instansi} />
          <Baris label="No. telepon" nilai={tiket.member.telp} />
        </dl>

        <dl className="grid gap-2.5 border-b px-5 py-4 text-sm">
          <Baris label="Space" nilai={tiket.space.nama ?? '—'} />
          <Baris label="Tipe" nilai={tiket.space.tipe ?? '—'} />
          <Baris label="Tanggal" nilai={tanggalDenganHari(tiket.jadwal.tanggal)} />
          <Baris
            label="Jam"
            nilai={`${tiket.jadwal.jam_mulai}–${tiket.jadwal.jam_selesai}`}
          />
          <Baris label="Durasi" nilai={tiket.jadwal.durasi} />
        </dl>

        <dl className="grid gap-2.5 px-5 py-4 text-sm">
          <Baris
            label="Tarif"
            nilai={<Rupiah nilai={tiket.rincian_pembayaran.tarif_kotor} />}
          />
          {tiket.rincian_pembayaran.diskon_promo ? (
            <Baris
              label={`Diskon ${tiket.rincian_pembayaran.diskon_promo}`}
              nilai={
                <span className="text-status-berhasil tabular-nums">
                  &minus;<Rupiah nilai={tiket.rincian_pembayaran.potongan} />
                </span>
              }
            />
          ) : null}
          <div className="flex items-center justify-between gap-4 border-t pt-2.5 text-base font-semibold">
            <dt>Total dibayar</dt>
            <dd>
              <Rupiah nilai={tiket.rincian_pembayaran.total_dibayar} />
            </dd>
          </div>
        </dl>

        <footer className="text-muted-foreground bg-muted/40 border-t px-5 py-3 text-center text-xs">
          Tunjukkan e-ticket ini saat check-in di lokasi.
        </footer>
      </article>

      <div className="mx-auto w-full max-w-md">
        <AksiTiket kodeBooking={tiket.kode_booking} />
      </div>
    </div>
  );
}

function Baris({ label, nilai }: { label: string; nilai: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right">{nilai}</dd>
    </div>
  );
}
