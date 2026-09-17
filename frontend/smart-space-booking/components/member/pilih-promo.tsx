'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, Tag, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { diskonAktif, periksaPromo } from '@/lib/api/diskon';
import { ApiError } from '@/lib/api/error';
import { qk } from '@/lib/query-keys';

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

const TANPA_PROMO = 'tanpa-promo';

/**
 * Pemilihan kode promo.
 *
 * Daftarnya diambil dengan `?id_space`, sehingga hanya promo milik pengelola
 * space tersebut yang ditawarkan. Backend menolak promo terbitan pengelola lain,
 * jadi menyaringnya di sini mencegah pengguna memilih sesuatu yang pasti gagal.
 *
 * Kode manual juga dikirim beserta `id_space` agar hasil pengecekannya sama
 * persis dengan yang nanti diterapkan saat memesan.
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

  const daftar = useQuery({
    queryKey: qk.diskon.aktif(idSpace),
    queryFn: () => diskonAktif(idSpace),
  });

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

  // Dua cara memilih promo tidak boleh aktif bersamaan: memilih dari katalog
  // mengosongkan kode manual, dan sebaliknya.
  const dariKatalog = value?.id_diskon !== undefined;
  const nilaiSelect = dariKatalog ? String(value.id_diskon) : TANPA_PROMO;

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
    <div className="grid gap-3">
      <div className="grid gap-2">
        <Label htmlFor="promo-katalog">Kode promo</Label>
        <Select
          value={nilaiSelect}
          onValueChange={(nilai) => {
            if (nilai === TANPA_PROMO) {
              onChange(null);
              return;
            }

            const promo = daftar.data?.find((d) => String(d.id) === nilai);

            if (promo) {
              onChange({
                id_diskon: promo.id,
                nama_diskon: promo.nama_diskon,
                persentase_diskon: promo.persentase_diskon,
              });
              setKode('');
            }
          }}
          disabled={nonaktif || daftar.isLoading}
        >
          <SelectTrigger id="promo-katalog" className="w-full">
            <SelectValue
              placeholder={
                daftar.isLoading ? 'Memuat promo…' : 'Pilih promo yang tersedia'
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TANPA_PROMO}>Tanpa promo</SelectItem>
            {(daftar.data ?? []).map((promo) => (
              <SelectItem key={promo.id} value={String(promo.id)}>
                {promo.nama_diskon} — {promo.persentase_diskon}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {daftar.data?.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Belum ada promo aktif untuk lokasi ini.
          </p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="promo-manual">Atau masukkan kode</Label>
        <div className="flex gap-2">
          <Input
            id="promo-manual"
            value={kode}
            // Kode promo di backend hanya berisi huruf kapital dan angka.
            onChange={(e) => setKode(e.target.value.toUpperCase().replace(/\s/g, ''))}
            placeholder="DISKONHEMAT20"
            disabled={nonaktif}
            className="font-mono uppercase"
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
      </div>
    </div>
  );
}
