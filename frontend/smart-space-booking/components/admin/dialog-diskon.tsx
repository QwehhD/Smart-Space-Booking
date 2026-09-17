'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { buatDiskon, perbaruiDiskon } from '@/lib/api/admin-diskon';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { qk } from '@/lib/query-keys';
import { isoKeLokal, lokalKeIso } from '@/lib/waktu-lokal';
import { skemaDiskon, type NilaiDiskon } from '@/lib/validations/admin';
import type { Diskon } from '@/types/entities';

const FIELD_BACKEND = [
  'nama_diskon',
  'persentase_diskon',
  'tanggal_awal',
  'tanggal_akhir',
] as const;

const KOSONG: NilaiDiskon = {
  nama_diskon: '',
  persentase_diskon: 10,
  tanggal_awal: '',
  tanggal_akhir: '',
};

/**
 * Form tambah dan ubah kode promo.
 *
 * Masa berlakunya diisi lewat `datetime-local` yang tidak mengenal zona waktu,
 * sedangkan backend menyimpan waktu penuh ISO. Konversinya dipatok ke WIB di
 * `lib/waktu-lokal.ts` supaya jam yang diketik pengelola sama dengan jam yang
 * tersimpan, apa pun zona peramban yang dipakai.
 */
export function DialogDiskon({
  terbuka,
  onTutup,
  diskon,
}: {
  terbuka: boolean;
  onTutup: () => void;
  /** Diisi berarti mengubah; kosong berarti menambah baru. */
  diskon?: Diskon;
}) {
  const queryClient = useQueryClient();
  const sedangUbah = Boolean(diskon);

  const form = useForm<NilaiDiskon>({
    resolver: zodResolver(skemaDiskon),
    defaultValues: KOSONG,
  });

  useEffect(() => {
    if (!terbuka) {
      return;
    }

    form.reset(
      diskon
        ? {
            nama_diskon: diskon.nama_diskon,
            persentase_diskon: diskon.persentase_diskon,
            tanggal_awal: isoKeLokal(diskon.tanggal_awal),
            tanggal_akhir: isoKeLokal(diskon.tanggal_akhir),
          }
        : KOSONG,
    );
  }, [terbuka, diskon, form]);

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiDiskon) => {
      const payload = {
        nama_diskon: nilai.nama_diskon,
        persentase_diskon: nilai.persentase_diskon,
        tanggal_awal: lokalKeIso(nilai.tanggal_awal),
        tanggal_akhir: lokalKeIso(nilai.tanggal_akhir),
      };

      return diskon ? perbaruiDiskon(diskon.id, payload) : buatDiskon(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.diskon.all });
      // Daftar promo aktif yang dilihat member ikut berubah.
      void queryClient.invalidateQueries({ queryKey: qk.diskon.all });

      toast.success(
        sedangUbah ? 'Diskon berhasil diperbarui!' : 'Diskon berhasil ditambahkan!',
      );
      onTutup();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, FIELD_BACKEND);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Gagal menyimpan diskon.',
        );
      }
    },
  });

  return (
    <Dialog open={terbuka} onOpenChange={(nilai) => (nilai ? null : onTutup())}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {sedangUbah ? 'Ubah kode promo' : 'Tambah kode promo'}
          </DialogTitle>
          <DialogDescription>
            Promo hanya berlaku untuk space milikmu sendiri, dan dinilai saat
            pemesanan dibuat, bukan pada tanggal sewanya.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="form-diskon"
            onSubmit={form.handleSubmit((nilai) => mutasi.mutate(nilai))}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="nama_diskon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode promo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DISKONHEMAT20"
                      autoCapitalize="characters"
                      {...field}
                      // Huruf kecil pasti ditolak backend, jadi diubah saat
                      // diketik alih alih menunggu pesan kesalahan.
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    Huruf kapital dan angka saja, tanpa spasi.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="persentase_diskon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potongan</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100}
                      {...field}
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>Dalam persen, 1 sampai 100.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tanggal_awal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mulai berlaku</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tanggal_akhir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Berakhir</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-muted-foreground text-xs">
              Waktu memakai zona WIB.
            </p>
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onTutup} disabled={mutasi.isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-diskon" disabled={mutasi.isPending}>
            {mutasi.isPending ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
