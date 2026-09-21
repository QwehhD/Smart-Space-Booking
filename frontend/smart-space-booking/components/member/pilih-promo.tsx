'use client';

import { useMutation } from '@tanstack/react-query';
import { Check, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { periksaPromo } from '@/lib/api/diskon';
import { ApiError } from '@/lib/api/error';

/**
 * Promo yang sedang dipakai.
 *
 * Menyimpan asalnya, karena backend menerima `id_diskon` untuk promo yang
 * dipilih dari katalog dan `kode_promo` untuk kode yang diketik manual. Keduanya
 * tidak dikirim bersamaan.
 */
export interface PromoTerpilih {
  id_diskon?: number;
  kode_promo?: string;
  nama_diskon: string;
  persentase_diskon: number;
}

/**
 * Pemakaian kode promo, hanya lewat ketikan.
 *
 * Sebelumnya tersedia juga daftar pilihan berisi seluruh promo aktif, tetapi
 * daftar itu membuat kode promo terbaca oleh siapa saja yang membuka form.
 * Pengelola ingin kodenya bersifat rahasia — hanya dipakai oleh yang memang
 * diberi tahu — sehingga yang tersisa hanya kolom ketik. Placeholder-nya pun
 * sengaja bukan contoh kode sungguhan.
 *
 * Kode dikirim beserta `id_space` agar hasil pengecekannya sama persis dengan
 * yang nanti diterapkan saat memesan, termasuk penolakan promo milik pengelola
 * lain.
 */
export function PilihPromo({
  idSpace,
  value,
  onChange,
  nonaktif,
}: {
  idSpace: number;
  value: PromoTerpilih | null;
  onChange: (promo: PromoTerpilih | null) => void;
  nonaktif?: boolean;
}) {
  const [kode, setKode] = useState('');

  const periksa = useMutation({
    mutationFn: (nama: string) => periksaPromo(nama, idSpace),
    onSuccess: (promo) => {
      onChange({
        kode_promo: promo.nama_diskon,
        nama_diskon: promo.nama_diskon,
        persentase_diskon: promo.persentase_diskon,
      });
      setKode('');
      toast.success(`Promo ${promo.nama_diskon} dipakai.`);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Kode promo tidak dapat dipakai.',
      );
    },
  });

  if (value) {
    return (
      <div className="grid gap-2">
        <Label>Kode promo</Label>
        <div className="border-status-berhasil bg-status-berhasil-bg flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Check className="text-status-berhasil size-4 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{value.nama_diskon}</p>
              <p className="text-muted-foreground text-xs">
                Potongan {value.persentase_diskon}%
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={nonaktif}
            onClick={() => onChange(null)}
          >
            <X />
            Lepas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="promo-manual">
        Kode promo{' '}
        <span className="text-muted-foreground font-normal">(opsional)</span>
      </Label>
      <div className="flex gap-2">
        <Input
          id="promo-manual"
          value={kode}
          // Kode promo di backend hanya berisi huruf kapital dan angka.
          onChange={(e) => setKode(e.target.value.toUpperCase().replace(/\s/g, ''))}
          onKeyDown={(e) => {
            // Enter memakai kode, bukan mengirim seluruh form pemesanan.
            if (e.key === 'Enter') {
              e.preventDefault();
              if (kode && !periksa.isPending) {
                periksa.mutate(kode);
              }
            }
          }}
          placeholder="Masukkan kode promo"
          autoComplete="off"
          spellCheck={false}
          disabled={nonaktif}
          className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
        />
        <Button
          type="button"
          variant="outline"
          disabled={nonaktif || !kode || periksa.isPending}
          onClick={() => periksa.mutate(kode)}
        >
          <Tag />
          {periksa.isPending ? 'Memeriksa…' : 'Pakai'}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Punya kode dari pengelola? Ketik di sini untuk mendapat potongan.
      </p>
    </div>
  );
}
