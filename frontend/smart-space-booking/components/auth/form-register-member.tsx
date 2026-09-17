'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
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
import { registerMember } from '@/lib/api/auth';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { unggahFotoMember } from '@/lib/api/upload';
import { simpanSesi } from '@/lib/auth/session';
import { BERANDA_ROLE } from '@/lib/constants';
import { qk } from '@/lib/query-keys';
import {
  skemaRegisterMember,
  type NilaiRegisterMember,
} from '@/lib/validations/auth';

/** Field yang benar-benar dikirim ke backend, dipakai memetakan error validasi. */
const FIELD_BACKEND = [
  'username',
  'password',
  'nama_member',
  'instansi',
  'alamat',
  'telp',
  'foto',
] as const;

/**
 * Pendaftaran member.
 *
 * Backend langsung mengembalikan access_token setelah registrasi berhasil,
 * sehingga pengguna tidak perlu login lagi dan langsung masuk ke katalog.
 */
export function FormRegisterMember() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<NilaiRegisterMember>({
    resolver: zodResolver(skemaRegisterMember),
    defaultValues: {
      nama_member: '',
      instansi: '',
      telp: '',
      alamat: '',
      username: '',
      password: '',
      konfirmasi_password: '',
      foto: undefined,
      setuju: false as unknown as true,
    },
  });

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiRegisterMember) =>
      registerMember({
        username: nilai.username,
        password: nilai.password,
        nama_member: nilai.nama_member,
        instansi: nilai.instansi,
        alamat: nilai.alamat,
        telp: nilai.telp,
        ...(nilai.foto ? { foto: nilai.foto } : {}),
      }),
    onSuccess: (hasil) => {
      simpanSesi(hasil.access_token, hasil.role);
      queryClient.setQueryData(qk.profil, {
        id: hasil.id,
        username: hasil.username,
        role: hasil.role,
        ...(hasil.member ? { member: hasil.member } : {}),
      });

      toast.success('Pendaftaran berhasil! Selamat datang.');
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
                label="Foto profil"
                keterangan="Opsional. JPG atau PNG, maksimal 2 MB."
                bentuk="bulat"
                value={field.value ?? null}
                unggah={unggahFotoMember}
                onChange={(filename) => field.onChange(filename ?? undefined)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nama_member"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Budi Raharjo" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instansi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instansi</FormLabel>
              <FormControl>
                <Input placeholder="SMK Telkom Malang" {...field} />
              </FormControl>
              <FormDescription>
                Nama sekolah, kampus, atau tempat kerja.
              </FormDescription>
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
                  placeholder="085712345678"
                  autoComplete="tel"
                  {...field}
                />
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="budi" autoComplete="username" {...field} />
              </FormControl>
              <FormDescription>
                Huruf, angka, titik, dan garis bawah.
              </FormDescription>
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
                  id="setuju-member"
                  checked={field.value}
                  onCheckedChange={(nilai) => field.onChange(nilai === true)}
                />
                <label
                  htmlFor="setuju-member"
                  className="text-sm leading-snug select-none"
                >
                  Saya setuju dengan Syarat &amp; Ketentuan yang berlaku.
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutasi.isPending} className="mt-2">
          <UserPlus />
          {mutasi.isPending ? 'Mendaftarkan…' : 'Daftar'}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </form>
    </Form>
  );
}
