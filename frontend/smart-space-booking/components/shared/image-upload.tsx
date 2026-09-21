'use client';

import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/error';
import { cn } from '@/lib/utils';

/** Jenis berkas yang diterima backend untuk foto space dan member. */
const JENIS_DITERIMA = 'image/jpeg,image/png';

/** Batas bawaan backend; dipakai untuk menolak lebih awal, bukan menggantikannya. */
const MAKS_BYTE = 2 * 1024 * 1024;

interface HasilUnggah {
  filename: string;
  url: string;
}

/**
 * Pemilih dan pengunggah foto.
 *
 * Alurnya dua langkah mengikuti backend: berkas diunggah lebih dulu ke endpoint
 * upload, lalu nama berkas hasilnya disimpan pada form utama sebagai field `foto`.
 * Karena itu komponen ini mengembalikan nama berkas, bukan berkasnya sendiri.
 *
 * Pratinjau memakai URL objek lokal supaya gambar langsung terlihat sebelum
 * unggahannya selesai.
 */
export function ImageUpload({
  value,
  previewUrl,
  onChange,
  unggah,
  label = 'Foto',
  keterangan,
  bentuk = 'kotak',
  className,
}: {
  value?: string | null;
  previewUrl?: string | null;
  onChange: (filename: string | null, url: string | null) => void;
  unggah: (berkas: File) => Promise<HasilUnggah>;
  label?: string;
  keterangan?: string;
  bentuk?: 'kotak' | 'bulat';
  className?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(previewUrl ?? null);
  const [mengunggah, setMengunggah] = useState(false);

  /**
   * URL objek lokal yang sedang dipakai sebagai pratinjau.
   *
   * URL ini baru boleh dicabut ketika sudah tidak ditampilkan lagi: saat diganti
   * berkas lain, saat fotonya dihapus, atau saat komponen dilepas. Sebelumnya ia
   * dicabut tepat setelah unggahan selesai, padahal selama mengunggah yang tampil
   * adalah spinner — sehingga `<img>` baru dipasang sesudah alamatnya tidak sah
   * lagi, dan pratinjau selalu tampil rusak.
   */
  const urlLokal = useRef<string | null>(null);

  function gantiUrlLokal(baru: string | null) {
    if (urlLokal.current) {
      URL.revokeObjectURL(urlLokal.current);
    }
    urlLokal.current = baru;
  }

  useEffect(() => () => gantiUrlLokal(null), []);

  async function pilihBerkas(berkas: File) {
    if (berkas.size > MAKS_BYTE) {
      toast.error('Ukuran foto melebihi 2 MB.');
      return;
    }

    const lokal = URL.createObjectURL(berkas);
    gantiUrlLokal(lokal);
    setPratinjau(lokal);
    setMengunggah(true);

    try {
      const hasil = await unggah(berkas);
      onChange(hasil.filename, hasil.url);
      toast.success('Foto berhasil diunggah.');
    } catch (error) {
      // Pratinjau dikembalikan ke keadaan sebelumnya agar tidak menampilkan
      // gambar yang sebenarnya gagal tersimpan.
      gantiUrlLokal(null);
      setPratinjau(previewUrl ?? null);
      onChange(null, null);
      toast.error(
        error instanceof ApiError ? error.message : 'Gagal mengunggah foto.',
      );
    } finally {
      setMengunggah(false);
    }
  }

  function hapus() {
    gantiUrlLokal(null);
    setPratinjau(null);
    onChange(null, null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <span className="text-sm leading-none font-medium">{label}</span>

      <div className="flex items-center gap-4">
        <div
          className={cn(
            'bg-muted text-muted-foreground flex size-20 shrink-0 items-center justify-center overflow-hidden border',
            bentuk === 'bulat' ? 'rounded-full' : 'rounded-md',
          )}
        >
          {mengunggah ? (
            <Loader2 className="size-5 animate-spin" />
          ) : pratinjau ? (
            // Berkas berasal dari backend sendiri maupun URL objek lokal, dan
            // ukurannya kecil, sehingga tag img biasa sudah memadai.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pratinjau}
              alt={label}
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>

        <div className="grid gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={JENIS_DITERIMA}
            className="sr-only"
            onChange={(e) => {
              const berkas = e.target.files?.[0];

              if (berkas) {
                void pilihBerkas(berkas);
              }
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={mengunggah}
              onClick={() => inputRef.current?.click()}
            >
              {value || pratinjau ? 'Ganti foto' : 'Pilih foto'}
            </Button>

            {value || pratinjau ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={mengunggah}
                onClick={hapus}
              >
                <Trash2 />
                Hapus
              </Button>
            ) : null}
          </div>

          <p className="text-muted-foreground text-xs">
            {keterangan ?? 'JPG atau PNG, maksimal 2 MB.'}
          </p>
        </div>
      </div>
    </div>
  );
}
