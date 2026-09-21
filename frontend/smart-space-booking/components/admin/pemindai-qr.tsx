'use client';

import { Camera, ImageUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/** Sisi terpanjang gambar yang diperiksa; lebih besar hanya memperlambat. */
const SISI_MAKS = 1000;

type Pembaca = (typeof import('jsqr'))['default'];

/**
 * jsQR dimuat saat pertama kali dibutuhkan, bukan ikut bundel halaman, karena
 * sebagian besar kunjungan ke halaman check-in cukup mengetik kode booking.
 */
async function muatPembaca(): Promise<Pembaca> {
  return (await import('jsqr')).default;
}

/** Menggambar sumber ke kanvas yang diperkecil, lalu mencari QR di dalamnya. */
function bacaDari(
  baca: Pembaca,
  kanvas: HTMLCanvasElement,
  sumber: CanvasImageSource,
  lebar: number,
  tinggi: number,
  teliti: boolean,
): string | null {
  const skala = Math.min(1, SISI_MAKS / Math.max(lebar, tinggi));
  const w = Math.round(lebar * skala);
  const h = Math.round(tinggi * skala);

  kanvas.width = w;
  kanvas.height = h;
  const ctx = kanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(sumber, 0, 0, w, h);
  const hasil = baca(ctx.getImageData(0, 0, w, h).data, w, h, {
    // Mencoba warna terbalik menggandakan waktu baca. Untuk kamera yang membaca
    // puluhan bingkai per detik itu tidak sepadan; untuk satu gambar unggahan,
    // sepadan.
    inversionAttempts: teliti ? 'attemptBoth' : 'dontInvert',
  });

  return hasil?.data ?? null;
}

function pesanGalatKamera(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Izin kamera ditolak. Izinkan kamera di pengaturan peramban, lalu coba lagi.';
    }
    if (error.name === 'NotFoundError') {
      return 'Tidak ada kamera yang terdeteksi di perangkat ini.';
    }
    if (error.name === 'NotReadableError') {
      return 'Kamera sedang dipakai aplikasi lain.';
    }
  }
  return 'Kamera tidak dapat dibuka.';
}

/**
 * Pemindai QR e-ticket, lewat kamera atau lewat gambar yang diunggah.
 *
 * Hasil bacaannya diserahkan ke `onTerbaca` apa adanya, lalu dicocokkan dengan
 * agenda hari ini oleh PanelCheckIn seperti isian yang diketik. Jadi pemindai
 * ini hanya pengganti mengetik; aturan siapa yang boleh di-check-in tetap sama.
 *
 * Kamera hanya dapat dibuka pada HTTPS atau localhost. Di luar itu peramban
 * tidak menyediakan `navigator.mediaDevices`, dan tombolnya menjelaskan hal itu
 * alih-alih diam-diam gagal. Unggah gambar tetap dapat dipakai di mana saja,
 * misalnya untuk tangkapan layar QR yang dikirim tamu lewat chat.
 */
export function PemindaiQr({ onTerbaca }: { onTerbaca: (teks: string) => void }) {
  const [kameraAktif, setKameraAktif] = useState(false);
  const [sedangMembaca, setSedangMembaca] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const kanvas = useRef<HTMLCanvasElement | null>(null);
  const aliran = useRef<MediaStream | null>(null);
  const bingkai = useRef<number | null>(null);
  const inputBerkas = useRef<HTMLInputElement>(null);

  function ambilKanvas(): HTMLCanvasElement {
    kanvas.current ??= document.createElement('canvas');
    return kanvas.current;
  }

  function matikanKamera() {
    if (bingkai.current !== null) cancelAnimationFrame(bingkai.current);
    bingkai.current = null;
    aliran.current?.getTracks().forEach((t) => t.stop());
    aliran.current = null;
    setKameraAktif(false);
  }

  // Kamera wajib dimatikan saat halaman ditinggalkan, supaya lampu kameranya
  // tidak tetap menyala.
  useEffect(() => matikanKamera, []);

  async function nyalakanKamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(
        'Kamera hanya dapat dibuka lewat HTTPS. Gunakan tombol unggah gambar QR.',
      );
      return;
    }

    try {
      const [baca, media] = await Promise.all([
        muatPembaca(),
        navigator.mediaDevices.getUserMedia({
          // Kamera belakang pada ponsel; di laptop peramban memilih yang ada.
          video: { facingMode: 'environment' },
          audio: false,
        }),
      ]);

      aliran.current = media;
      setKameraAktif(true);

      // Elemen video baru ada setelah render berikutnya.
      requestAnimationFrame(() => void mulaiMemindai(baca, media));
    } catch (error) {
      matikanKamera();
      toast.error(pesanGalatKamera(error));
    }
  }

  async function mulaiMemindai(baca: Pembaca, media: MediaStream) {
    const el = video.current;
    if (!el) return;

    el.srcObject = media;
    await el.play().catch(() => undefined);

    const periksa = () => {
      if (!aliran.current) return;

      if (el.readyState >= el.HAVE_ENOUGH_DATA && el.videoWidth > 0) {
        const teks = bacaDari(
          baca,
          ambilKanvas(),
          el,
          el.videoWidth,
          el.videoHeight,
          false,
        );

        if (teks) {
          matikanKamera();
          onTerbaca(teks);
          toast.success('QR terbaca.');
          return;
        }
      }

      bingkai.current = requestAnimationFrame(periksa);
    };

    bingkai.current = requestAnimationFrame(periksa);
  }

  async function bacaBerkas(berkas: File) {
    setSedangMembaca(true);

    try {
      const [baca, gambar] = await Promise.all([
        muatPembaca(),
        createImageBitmap(berkas),
      ]);
      const teks = bacaDari(
        baca,
        ambilKanvas(),
        gambar,
        gambar.width,
        gambar.height,
        true,
      );
      gambar.close();

      if (teks) {
        onTerbaca(teks);
        toast.success('QR terbaca.');
      } else {
        toast.error(
          'Tidak ada QR yang terbaca di gambar itu. Pastikan QR-nya utuh dan tidak buram.',
        );
      }
    } catch {
      toast.error('Gambar tidak dapat dibuka.');
    } finally {
      setSedangMembaca(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {kameraAktif ? (
          <Button type="button" variant="outline" size="sm" onClick={matikanKamera}>
            <X />
            Tutup kamera
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={() => void nyalakanKamera()}>
            <Camera />
            Pindai dengan kamera
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={sedangMembaca}
          onClick={() => inputBerkas.current?.click()}
        >
          <ImageUp />
          {sedangMembaca ? 'Membaca…' : 'Unggah gambar QR'}
        </Button>

        <input
          ref={inputBerkas}
          id="unggah-qr"
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-label="Unggah gambar QR"
          onChange={(e) => {
            const berkas = e.target.files?.[0];
            // Dikosongkan supaya memilih berkas yang sama sekali lagi tetap
            // memicu onChange.
            e.target.value = '';
            if (berkas) void bacaBerkas(berkas);
          }}
        />
      </div>

      {kameraAktif ? (
        <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl border bg-black">
          <video
            ref={video}
            muted
            playsInline
            className="size-full object-cover"
            aria-label="Pratinjau kamera"
          />
          {/* Bingkai bidik, hanya penanda; QR di luar bingkai tetap terbaca. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[18%] rounded-lg border-2 border-primary/90 shadow-[0_0_0_9999px_rgb(0_0_0/0.35)]"
          />
          <p className="absolute inset-x-0 bottom-2 text-center text-xs font-medium text-white">
            Arahkan kamera ke QR e-ticket
          </p>
        </div>
      ) : null}
    </div>
  );
}
