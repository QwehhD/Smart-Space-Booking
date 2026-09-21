'use client';

import { Download, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * Tombol cetak, unduh QR, dan bagikan pada e-ticket.
 *
 * Unduh QR menyimpan gambar QR saja sebagai PNG, supaya member dapat
 * menunjukkannya dari galeri ponsel tanpa membuka web ini, misalnya saat sinyal
 * di lokasi lemah. Gambarnya sudah berupa data URI dari backend, jadi cukup
 * tautan dengan atribut `download`.
 *
 * Cetak memakai dialog cetak peramban, sehingga pengguna dapat memilih
 * "Simpan sebagai PDF" tanpa pustaka tambahan. Tata letak cetaknya diatur
 * stylesheet `@media print` di globals.css.
 *
 * Bagikan memakai Web Share API bila tersedia, dan jatuh ke penyalinan tautan
 * bila tidak. Keduanya hanya ada di peramban, jadi komponen ini berjalan di klien.
 */
export function AksiTiket({
  kodeBooking,
  qrDataUrl,
}: {
  kodeBooking: string;
  qrDataUrl: string;
}) {
  async function bagikan() {
    const tautan = window.location.href;
    const teks = `Tiket reservasi ${kodeBooking}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: teks, text: teks, url: tautan });
        return;
      } catch (error) {
        // Pengguna membatalkan dialog berbagi; itu bukan kegagalan.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(`${teks}\n${tautan}`);
      toast.success('Tautan tiket disalin.');
    } catch {
      toast.error('Gagal menyalin tautan tiket.');
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
      <Button
        className="font-semibold shadow-md shadow-primary/20 hover:shadow-primary/35"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        Cetak / Simpan PDF
      </Button>
      <Button
        variant="outline"
        className="font-semibold"
        render={<a href={qrDataUrl} download={`QR-${kodeBooking}.png`} />}
      >
        <Download className="size-4" />
        Unduh QR
      </Button>
      <Button
        variant="outline"
        className="font-semibold"
        onClick={() => void bagikan()}
      >
        <Share2 className="size-4" />
        Bagikan Tiket
      </Button>
    </div>
  );
}
