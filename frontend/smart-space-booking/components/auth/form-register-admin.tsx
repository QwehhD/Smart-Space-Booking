'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/shared/image-upload';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { registerAdminSpace } from '@/lib/api/auth';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { unggahGambar } from '@/lib/api/upload';
import { simpanSesi } from '@/lib/auth/session';
import { BERANDA_ROLE } from '@/lib/constants';
import { qk } from '@/lib/query-keys';
import {
  skemaRegisterAdmin,
  type NilaiRegisterAdmin,
} from '@/lib/validations/auth';

const FIELD_BACKEND = [
  'username',
  'password',
  'nama_coworking',
  'nama_pemilik',
  'telp',
  'alamat',
  'deskripsi',
  'foto',
] as const;

/**
 * Pendaftaran pengelola lokasi.
 *
 * Foto lokasi diunggah ke endpoint gambar umum, bukan endpoint foto space,
 * karena backend menyajikan foto pengelola dari folder `general`.
 */
export function FormRegisterAdmin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<NilaiRegisterAdmin>({
    resolver: zodResolver(skemaRegisterAdmin),
    defaultValues: {
      nama_coworking: '',
      nama_pemilik: '',
      telp: '',
      alamat: '',
      deskripsi: '',
      username: '',
      password: '',
      konfirmasi_password: '',
      foto: undefined,
      setuju: false as unknown as true,
    },
  });

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiRegisterAdmin) =>
      registerAdminSpace({
        username: nilai.username,
        password: nilai.password,
        nama_coworking: nilai.nama_coworking,
        nama_pemilik: nilai.nama_pemilik,
        telp: nilai.telp,
        // Field opsional hanya dikirim bila diisi, agar tidak menimpa nilai lama
        // dengan teks kosong.
        ...(nilai.alamat ? { alamat: nilai.alamat } : {}),
        ...(nilai.deskripsi ? { deskripsi: nilai.deskripsi } : {}),
        ...(nilai.foto ? { foto: nilai.foto } : {}),
      }),
    onSuccess: (hasil) => {
      simpanSesi(hasil.access_token, hasil.role);
      queryClient.setQueryData(qk.profil, {
        id: hasil.id,
        username: hasil.username,
        role: hasil.role,
        ...(hasil.space_owner ? { space_owner: hasil.space_owner } : {}),
      });

      toast.success('Lokasi berhasil didaftarkan!');
      router.replace(BERANDA_ROLE[hasil.role]);
      router.refresh();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, FIELD_BACKEND);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Pendaftaran gagal.',
        );
      }
    },
  });

  return (
    <Form {...form}>
      <form
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
                label="Foto lokasi"
                keterangan="Opsional. JPG atau PNG, maksimal 2 MB."
                value={field.value ?? null}
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
                <Input inputMode="tel" placeholder="081298765432" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alamat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Alamat <span className="text-muted-foreground font-normal">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Jl. Danau Ranau No. 1, Malang" {...field} />
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
              <FormLabel>
                Deskripsi fasilitas{' '}
                <span className="text-muted-foreground font-normal">(opsional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="WiFi 100Mbps, ruang rapat, parkir luas."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username admin</FormLabel>
              <FormControl>
                <Input placeholder="admin_moklet" autoComplete="username" {...field} />
              </FormControl>
              <FormDescription>Huruf, angka, titik, dan garis bawah.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="konfirmasi_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="setuju"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2.5">
                <Checkbox
                  id="setuju-admin"
                  checked={field.value}
                  onCheckedChange={(nilai) => field.onChange(nilai === true)}
                />
                <label htmlFor="setuju-admin" className="text-sm leading-snug select-none">
                  Saya setuju dengan Syarat &amp; Ketentuan yang berlaku.
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={mutasi.isPending}
          className="mt-2 h-11 text-sm font-bold shadow-md shadow-primary/25 hover:shadow-primary/35"
        >
          <Building2 className="size-4" />
          {mutasi.isPending ? 'Mendaftarkan Lokasi…' : 'Daftarkan Coworking Space'}
        </Button>

        <p className="text-muted-foreground text-center text-xs sm:text-sm pt-2">
          Sudah punya akun pengelola?{' '}
          <Link href="/admin/login" className="text-aksen font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </form>
    </Form>
  );
}
