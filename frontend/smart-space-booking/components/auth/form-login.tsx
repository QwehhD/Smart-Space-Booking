'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/api/auth';
import { applyFieldErrors, ApiError } from '@/lib/api/error';
import { simpanSesi } from '@/lib/auth/session';
import { BERANDA_ROLE, LABEL_ROLE } from '@/lib/constants';
import { qk } from '@/lib/query-keys';
import { skemaLogin, type NilaiLogin } from '@/lib/validations/auth';
import type { Role } from '@/types/entities';

/**
 * Form login, dipakai member dan admin.
 *
 * Backend hanya punya satu endpoint login untuk kedua role, sehingga halamannya
 * yang membedakan. Bila role hasil login tidak cocok dengan halaman yang dibuka,
 * sesinya sengaja tidak disimpan: membiarkannya berarti pengguna masuk ke panel
 * yang bukan haknya lalu ditolak satu per satu oleh backend.
 */
export function FormLogin({
  roleDiharapkan,
  next,
  tautanDaftar,
}: {
  roleDiharapkan: Role;
  next?: string;
  tautanDaftar: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [lihatPassword, setLihatPassword] = useState(false);

  const form = useForm<NilaiLogin>({
    resolver: zodResolver(skemaLogin),
    defaultValues: { username: '', password: '' },
  });

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiLogin) => login(nilai),
    onSuccess: (hasil) => {
      if (hasil.role !== roleDiharapkan) {
        form.setError('username', {
          type: 'server',
          message: `Akun ini terdaftar sebagai ${LABEL_ROLE[hasil.role]}.`,
        });
        toast.error(
          `Gunakan halaman login ${LABEL_ROLE[hasil.role]} untuk akun ini.`,
        );
        return;
      }

      simpanSesi(hasil.access_token, hasil.role);
      queryClient.setQueryData(qk.profil, {
        id: hasil.id,
        username: hasil.username,
        role: hasil.role,
        ...(hasil.member ? { member: hasil.member } : {}),
        ...(hasil.space_owner ? { space_owner: hasil.space_owner } : {}),
      });

      toast.success('Login berhasil!');
      router.replace(next || BERANDA_ROLE[hasil.role]);
      router.refresh();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, [
        'username',
        'password',
      ]);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Gagal masuk. Coba lagi.',
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-xs text-foreground">Username</FormLabel>
              <FormControl>
                <Input
                  autoComplete="username"
                  placeholder="Masukkan username"
                  className="h-11 rounded-xl border-border/75 bg-background text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-xs text-foreground">Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={lihatPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-border/75 bg-background pr-10 text-sm"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setLihatPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute inset-y-0 right-0 flex items-center px-3.5 focus-visible:ring-2 focus-visible:outline-none"
                  aria-label={
                    lihatPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {lihatPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
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
          <LogIn className="size-4" />
          {mutasi.isPending ? 'Memproses…' : 'Masuk Sekarang'}
        </Button>

        <p className="text-muted-foreground text-center text-xs sm:text-sm pt-2">
          Belum punya akun?{' '}
          <Link href={tautanDaftar} className="text-aksen font-bold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </form>
    </Form>
  );
}
