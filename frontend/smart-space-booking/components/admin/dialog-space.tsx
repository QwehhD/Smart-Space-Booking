'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/image-upload';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { buatSpace, perbaruiSpace } from '@/lib/api/admin-spaces';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { unggahFotoSpace } from '@/lib/api/upload';
import { LABEL_TIPE, URUTAN_TIPE } from '@/lib/constants';
import { qk } from '@/lib/query-keys';
import { skemaSpace, type NilaiSpace } from '@/lib/validations/admin';
import type { Space } from '@/types/entities';

const FIELD_BACKEND = [
  'nama_space',
  'harga_per_jam',
  'tipe',
  'kapasitas',
  'deskripsi',
  'foto',
] as const;

const KOSONG: NilaiSpace = {
  nama_space: '',
  harga_per_jam: 0,
  tipe: 'desk',
  kapasitas: 1,
  deskripsi: '',
  foto: undefined,
};

/**
 * Form tambah dan ubah ruangan dalam satu dialog.
 *
 * Keduanya memakai satu komponen karena payload-nya identik; yang membedakan
 * hanya endpoint tujuan dan nilai awalnya. Menyatukannya membuat aturan validasi
 * tidak mungkin berbeda antara menambah dan mengubah.
 */
export function DialogSpace({
  terbuka,
  onTutup,
  space,
}: {
  terbuka: boolean;
  onTutup: () => void;
  /** Diisi berarti mengubah; kosong berarti menambah baru. */
  space?: Space;
}) {
  const queryClient = useQueryClient();
  const sedangUbah = Boolean(space);

  const form = useForm<NilaiSpace>({
    resolver: zodResolver(skemaSpace),
    defaultValues: KOSONG,
  });

  // Dialog tidak dilepas dari pohon saat ditutup, jadi nilainya disetel ulang
  // setiap kali dibuka supaya sisa isian sebelumnya tidak terbawa.
  useEffect(() => {
    if (!terbuka) {
      return;
    }

    form.reset(
      space
        ? {
            nama_space: space.nama_space,
            harga_per_jam: space.harga_per_jam,
            tipe: space.tipe,
            kapasitas: space.kapasitas,
            deskripsi: space.deskripsi,
            foto: space.foto ?? undefined,
          }
        : KOSONG,
    );
  }, [terbuka, space, form]);

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiSpace) =>
      space ? perbaruiSpace(space.id, nilai) : buatSpace(nilai),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.spaces.all });
      // Katalog publik menampilkan ruangan yang sama, jadi ikut dibatalkan.
      void queryClient.invalidateQueries({ queryKey: qk.spaces.all });

      toast.success(
        sedangUbah ? 'Data space berhasil diperbarui!' : 'Space berhasil ditambahkan!',
      );
      onTutup();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, FIELD_BACKEND);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Gagal menyimpan space.',
        );
      }
    },
  });

  return (
    <Dialog open={terbuka} onOpenChange={(nilai) => (nilai ? null : onTutup())}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{sedangUbah ? 'Ubah space' : 'Tambah space'}</DialogTitle>
          <DialogDescription>
            {sedangUbah
              ? 'Perubahan langsung terlihat pada katalog yang dilihat calon penyewa.'
              : 'Space yang ditambahkan langsung muncul di katalog publik.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="form-space"
            onSubmit={form.handleSubmit((nilai) => mutasi.mutate(nilai))}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="foto"
              render={({ field }) => (
                <FormItem>
                  <ImageUpload
                    label="Foto space"
                    keterangan="Opsional. JPG atau PNG, maksimal 2 MB."
                    value={field.value ?? null}
                    previewUrl={space?.foto_url ?? null}
                    unggah={unggahFotoSpace}
                    onChange={(filename) => field.onChange(filename ?? undefined)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nama_space"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama space</FormLabel>
                  <FormControl>
                    <Input placeholder="Personal Desk - Flexi 01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tipe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(nilai) => {
                        // base-ui mengirim null saat pilihan dikosongkan.
                        if (nilai) {
                          field.onChange(nilai);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {URUTAN_TIPE.map((tipe) => (
                          <SelectItem key={tipe} value={tipe}>
                            {LABEL_TIPE[tipe]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kapasitas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        {...field}
                        value={Number.isNaN(field.value) ? '' : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>Jumlah orang.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="harga_per_jam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harga per jam</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1000}
                      {...field}
                      value={Number.isNaN(field.value) ? '' : field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>Dalam Rupiah, tanpa titik.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi fasilitas</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="WiFi 100Mbps, stopkontak, lampu meja LED."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button variant="outline" onClick={onTutup} disabled={mutasi.isPending}>
            Batal
          </Button>
          <Button type="submit" form="form-space" disabled={mutasi.isPending}>
            {mutasi.isPending ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
