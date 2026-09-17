'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/image-upload';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { simpanProfilLokasi } from '@/lib/api/admin-profil';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { unggahGambar } from '@/lib/api/upload';
import { qk } from '@/lib/query-keys';
import {
  skemaProfilLokasi,
  type NilaiProfilLokasi,
} from '@/lib/validations/admin';
import type { SpaceOwner } from '@/types/entities';

const FIELD_BACKEND = [
  'nama_coworking',
  'nama_pemilik',
  'telp',
  'alamat',
  'deskripsi',
  'foto',
] as const;

/**
 * Penyuntingan data lokasi coworking space.
 *
 * Data inilah yang tampil di katalog publik dan tercetak pada e-ticket, jadi
 * setiap perubahannya langsung terlihat pengunjung. Karena itu formnya diisi
 * lebih dulu dengan nilai tersimpan dan tombol simpan hanya aktif ketika benar
 * benar ada yang berubah.
 *
 * Field opsional yang dikosongkan tidak dikirim, karena backend menuntut minimal
 * 3 karakter bila field itu ada. Konsekuensinya alamat dan deskripsi yang sudah
 * terisi tidak dapat dikosongkan kembali lewat form ini, hanya diganti isinya.
 */
export function FormProfilLokasi({ profil }: { profil: SpaceOwner }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<NilaiProfilLokasi>({
    resolver: zodResolver(skemaProfilLokasi),
    defaultValues: {
      nama_coworking: profil.nama_coworking,
      nama_pemilik: profil.nama_pemilik,
      telp: profil.telp,
      alamat: profil.alamat ?? '',
      deskripsi: profil.deskripsi ?? '',
      foto: profil.foto ?? undefined,
    },
  });

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiProfilLokasi) =>
      simpanProfilLokasi({
        nama_coworking: nilai.nama_coworking,
        nama_pemilik: nilai.nama_pemilik,
        telp: nilai.telp,
        ...(nilai.alamat ? { alamat: nilai.alamat } : {}),
        ...(nilai.deskripsi ? { deskripsi: nilai.deskripsi } : {}),
        ...(nilai.foto ? { foto: nilai.foto } : {}),
      }),
    onSuccess: (hasil) => {
      queryClient.setQueryData(qk.admin.profil, hasil);
      void queryClient.invalidateQueries({ queryKey: qk.profil });

      // Form disetel ulang dengan nilai dari server, bukan nilai yang diketik,
      // supaya penanda "belum disimpan" hilang dan nilai yang tampil benar benar
      // yang tersimpan.
      form.reset({
        nama_coworking: hasil.nama_coworking,
        nama_pemilik: hasil.nama_pemilik,
        telp: hasil.telp,
        alamat: hasil.alamat ?? '',
        deskripsi: hasil.deskripsi ?? '',
        foto: hasil.foto ?? undefined,
      });

      toast.success('Profil lokasi berhasil disimpan!');

      // Halaman ini dirender di server, jadi datanya perlu diambil ulang agar
      // sapaan pada dashboard dan katalog ikut memakai nama yang baru.
      router.refresh();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, FIELD_BACKEND);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Gagal menyimpan profil.',
        );
      }
    },
  });

  const adaPerubahan = form.formState.isDirty;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((nilai) => mutasi.mutate(nilai))}
        className="bg-card grid gap-4 rounded-lg border p-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="foto"
          render={({ field }) => (
            <FormItem>
              <ImageUpload
                label="Foto lokasi"
                keterangan="JPG atau PNG, maksimal 2 MB. Tampil di katalog space."
                value={field.value ?? null}
                previewUrl={profil.foto_url}
                unggah={unggahGambar}
                onChange={(filename) => field.onChange(filename ?? undefined)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama_coworking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama coworking space</FormLabel>
              <FormControl>
                <Input placeholder="Moklet Hub Coworking Space" {...field} />
              </FormControl>
              <FormDescription>
                Nama ini yang dilihat calon penyewa pada katalog.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama_pemilik"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama pemilik</FormLabel>
              <FormControl>
                <Input placeholder="Ahmad Bidin, S.Kom" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. telepon</FormLabel>
              <FormControl>
                <Input
                  inputMode="tel"
                  placeholder="081298765432"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Dicantumkan pada e-ticket agar penyewa dapat menghubungi lokasi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alamat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Jl. Danau Ranau No. 1, Sawojajar, Malang"
                  {...field}
                />
              </FormControl>
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
                  rows={4}
                  placeholder="WiFi 100Mbps, ruang rapat lengkap, parkir luas."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          {adaPerubahan ? (
            <p className="text-muted-foreground mr-auto text-sm">
              Ada perubahan yang belum disimpan.
            </p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={!adaPerubahan || mutasi.isPending}
          >
            Batalkan perubahan
          </Button>

          <Button type="submit" disabled={!adaPerubahan || mutasi.isPending}>
            <Save />
            {mutasi.isPending ? 'Menyimpan…' : 'Simpan perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
