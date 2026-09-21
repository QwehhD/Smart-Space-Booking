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
    <div className="grid gap-6 masuk">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit print:hidden font-medium text-muted-foreground hover:text-foreground"
        render={
          <Link href="/tiket" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Kembali ke daftar tiket
          </Link>
        }
      />

      <article className="cetak-tiket relative bg-card shadow-lg hover:shadow-xl transition-shadow mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-border/80">
        {/* Header Tiket */}
        <header className="relative bg-gradient-to-b from-primary/10 via-accent/20 to-transparent border-b border-border/70 px-6 py-5 text-center">
          <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-0.5 text-[10px] font-bold font-mono tracking-widest uppercase text-aksen">
            E-Ticket Resmi
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">
            {tiket.coworking_space.nama}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">
            {tiket.coworking_space.telepon}
          </p>
        </header>

        {/* Area QR Code dengan Laser Scanner Animasi */}
        <div className="grid justify-items-center gap-3.5 border-b border-dashed border-border px-6 py-6 bg-muted/15">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/25 bg-white p-3 shadow-md">
            {/* Animasi Laser Pemindai */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-xs shadow-primary animate-laser z-20 print:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tiket.qr_code_data_url}
              alt={`QR code untuk ${tiket.kode_booking}`}
              width={180}
              height={180}
              className="relative z-10 size-40 sm:size-44"
            />
          </div>

          <div className="text-center grid gap-0.5">
            <p className="font-mono text-xl font-bold tracking-wider text-foreground">
              {tiket.kode_booking}
            </p>
            <p className="text-muted-foreground font-mono text-xs">
              No. Tiket: {tiket.e_ticket_number}
            </p>
          </div>

          <StatusBadge status={tiket.status_reservasi} />
        </div>

        {/* Perforated Notch Divider Visual */}
        <div className="relative flex items-center justify-between px-2 py-1 print:hidden" aria-hidden>
          <div className="-ml-5 size-6 rounded-full bg-background border-r border-border" />
          <div className="flex-1 border-t-2 border-dashed border-border/70 mx-2" />
          <div className="-mr-5 size-6 rounded-full bg-background border-l border-border" />
        </div>

        {/* Identitas Tamu */}
        <dl className="grid gap-2.5 border-b border-border/70 px-6 py-4 text-xs sm:text-sm">
          <Baris label="Nama Pemesan" nilai={<span className="font-semibold text-foreground">{tiket.member.nama}</span>} />
          <Baris label="Instansi" nilai={tiket.member.instansi || '—'} />
          <Baris label="No. Telepon" nilai={tiket.member.telp} />
        </dl>

        {/* Jadwal & Ruangan */}
        <dl className="grid gap-2.5 border-b border-border/70 px-6 py-4 text-xs sm:text-sm">
          <Baris label="Ruangan" nilai={<span className="font-semibold text-foreground">{tiket.space.nama ?? '—'}</span>} />
          <Baris label="Kategori" nilai={tiket.space.tipe ?? '—'} />
          <Baris label="Hari & Tanggal" nilai={tanggalDenganHari(tiket.jadwal.tanggal)} />
          <Baris
            label="Waktu Sewa"
            nilai={<span className="font-semibold text-foreground">{`${tiket.jadwal.jam_mulai} – ${tiket.jadwal.jam_selesai}`}</span>}
          />
          <Baris label="Durasi Total" nilai={`${tiket.jadwal.durasi} jam`} />
        </dl>

        {/* Rincian Pembayaran */}
        <dl className="grid gap-2.5 px-6 py-5 text-xs sm:text-sm bg-muted/10">
          <Baris
            label="Tarif Normal"
            nilai={<Rupiah nilai={tiket.rincian_pembayaran.tarif_kotor} />}
          />
          {tiket.rincian_pembayaran.diskon_promo ? (
            <Baris
              label={`Diskon Promo (${tiket.rincian_pembayaran.diskon_promo})`}
              nilai={
                <span className="text-status-berhasil font-semibold tabular-nums">
                  &minus;<Rupiah nilai={tiket.rincian_pembayaran.potongan} />
                </span>
              }
            />
          ) : null}
          <div className="flex items-center justify-between gap-4 border-t border-border/70 pt-3 text-base font-bold">
            <dt className="text-foreground">Total Dibayar</dt>
            <dd className="text-aksen font-extrabold text-lg">
              <Rupiah nilai={tiket.rincian_pembayaran.total_dibayar} />
            </dd>
          </div>
        </dl>

        {/* Barcode Visual Decoration */}
        <div className="border-t border-dashed border-border/70 px-6 pt-4 pb-3 flex flex-col items-center gap-1.5 opacity-80" aria-hidden>
          <div className="flex h-8 items-stretch gap-1">
            <span className="w-1 bg-foreground" />
            <span className="w-0.5 bg-foreground" />
            <span className="w-2 bg-foreground" />
            <span className="w-1 bg-foreground" />
            <span className="w-0.5 bg-foreground" />
            <span className="w-1.5 bg-foreground" />
            <span className="w-1 bg-foreground" />
            <span className="w-2 bg-foreground" />
            <span className="w-0.5 bg-foreground" />
            <span className="w-1 bg-foreground" />
            <span className="w-2 bg-foreground" />
            <span className="w-1 bg-foreground" />
            <span className="w-0.5 bg-foreground" />
            <span className="w-2 bg-foreground" />
          </div>
          <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
            SSP-{tiket.kode_booking}
          </span>
        </div>

        <footer className="text-muted-foreground bg-muted/40 border-t border-border/70 px-6 py-3 text-center text-xs">
          Tunjukkan e-ticket ini kepada pengelola saat check-in di lokasi.
        </footer>
      </article>

      <div className="mx-auto w-full max-w-md">
        <AksiTiket
          kodeBooking={tiket.kode_booking}
          qrDataUrl={tiket.qr_code_data_url}
        />
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
