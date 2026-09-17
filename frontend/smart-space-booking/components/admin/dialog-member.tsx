'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm, type Control, type FieldValues, type Path } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { buatMember, perbaruiMember } from '@/lib/api/admin-members';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { unggahFotoMember } from '@/lib/api/upload';
import { qk } from '@/lib/query-keys';
import {
  skemaMemberBaru,
  skemaMemberUbah,
  type NilaiMemberBaru,
  type NilaiMemberUbah,
} from '@/lib/validations/admin';
import type { Member } from '@/types/entities';

/**
 * Daftar field yang boleh dipasangi pesan kesalahan dari backend.
 *
 * Dipisah per form karena form ubah tidak mengirim `username` sama sekali,
 * sehingga tidak mungkin menerima kesalahan untuk field itu dan tipenya pun
 * tidak memilikinya.
 */
const FIELD_TAMBAH = [
  'username',
  'password',
  'nama_member',
  'instansi',
  'alamat',
  'telp',
  'foto',
] as const;

const FIELD_UBAH = [
  'password',
  'nama_member',
  'instansi',
  'alamat',
  'telp',
  'foto',
] as const;

/**
 * Form tambah dan ubah member.
 *
 * Berbeda dari dialog space dan diskon, di sini skemanya memang berbeda antara
 * menambah dan mengubah: `username` tidak dapat diubah dan `password` menjadi
 * opsional saat mengubah, mengikuti `UpdateMemberAdminDto` di backend. Karena
 * itu komponennya dipecah menjadi dua form terpisah, bukan satu form dengan
 * field yang disembunyikan, supaya tipe dan validasinya tidak bercampur.
 */
export function DialogMember({
  terbuka,
  onTutup,
  member,
}: {
  terbuka: boolean;
  onTutup: () => void;
  /** Diisi berarti mengubah; kosong berarti menambah baru. */
  member?: Member;
}) {
  return (
    <Dialog open={terbuka} onOpenChange={(nilai) => (nilai ? null : onTutup())}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{member ? 'Ubah member' : 'Tambah member'}</DialogTitle>
          <DialogDescription>
            {member
              ? 'Username tidak dapat diubah. Kosongkan password bila tidak ingin mengaturnya ulang.'
              : 'Akun yang dibuat di sini langsung dapat dipakai member untuk masuk.'}
          </DialogDescription>
        </DialogHeader>

        {member ? (
          <FormUbah member={member} terbuka={terbuka} onSelesai={onTutup} />
        ) : (
          <FormTambah terbuka={terbuka} onSelesai={onTutup} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const KOSONG: NilaiMemberBaru = {
  username: '',
  password: '',
  nama_member: '',
  instansi: '',
  alamat: '',
  telp: '',
  foto: undefined,
};

function FormTambah({
  terbuka,
  onSelesai,
}: {
  terbuka: boolean;
  onSelesai: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<NilaiMemberBaru>({
    resolver: zodResolver(skemaMemberBaru),
    defaultValues: KOSONG,
  });

  useEffect(() => {
    if (terbuka) {
      form.reset(KOSONG);
    }
  }, [terbuka, form]);

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiMemberBaru) => buatMember(nilai),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.members.all });
      toast.success('Member berhasil ditambahkan!');
      onSelesai();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, FIELD_TAMBAH);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Gagal menyimpan member.',
        );
      }
    },
  });

  return (
    <>
      <Form {...form}>
        <form
          id="form-member"
          onSubmit={form.handleSubmit((nilai) => mutasi.mutate(nilai))}
          className="grid gap-4"
          noValidate
        >
          <FotoMember control={form.control} previewUrl={null} />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="budi" autoComplete="off" {...field} />
                </FormControl>
                <FormDescription>
                  Huruf, angka, titik, dan garis bawah. Tidak dapat diubah nanti.
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

          <FieldDataDiri control={form.control} />
        </form>
      </Form>

      <TombolDialog sedangProses={mutasi.isPending} onBatal={onSelesai} />
    </>
  );
}

function FormUbah({
  member,
  terbuka,
  onSelesai,
}: {
  member: Member;
  terbuka: boolean;
  onSelesai: () => void;
}) {
  const queryClient = useQueryClient();

  const form = useForm<NilaiMemberUbah>({
    resolver: zodResolver(skemaMemberUbah),
    defaultValues: {
      password: '',
      nama_member: member.nama_member,
      instansi: member.instansi,
      alamat: member.alamat,
      telp: member.telp,
      foto: member.foto ?? undefined,
    },
  });

  useEffect(() => {
    if (terbuka) {
      form.reset({
        password: '',
        nama_member: member.nama_member,
        instansi: member.instansi,
        alamat: member.alamat,
        telp: member.telp,
        foto: member.foto ?? undefined,
      });
    }
  }, [terbuka, member, form]);

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiMemberUbah) =>
      perbaruiMember(member.id, {
        nama_member: nilai.nama_member,
        instansi: nilai.instansi,
        alamat: nilai.alamat,
        telp: nilai.telp,
        // Password kosong berarti tidak mengatur ulang, jadi tidak dikirim sama
        // sekali; mengirim string kosong akan ditolak backend.
        ...(nilai.password ? { password: nilai.password } : {}),
        ...(nilai.foto ? { foto: nilai.foto } : {}),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.members.all });
      toast.success('Data member berhasil diperbarui!');
      onSelesai();
    },
    onError: (error: unknown) => {
      const terpasang = applyFieldErrors(error, form.setError, FIELD_UBAH);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Gagal menyimpan member.',
        );
      }
    },
  });

  return (
    <>
      <Form {...form}>
        <form
          id="form-member"
          onSubmit={form.handleSubmit((nilai) => mutasi.mutate(nilai))}
          className="grid gap-4"
          noValidate
        >
          <FotoMember control={form.control} previewUrl={member.foto_url} />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Password baru{' '}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Biarkan kosong bila tidak diubah"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FieldDataDiri control={form.control} />
        </form>
      </Form>

      <TombolDialog sedangProses={mutasi.isPending} onBatal={onSelesai} />
    </>
  );
}

/* ---------- bagian yang dipakai kedua form ---------- */

/**
 * Data diri yang bentuknya sama persis pada kedua form.
 *
 * Komponen di bawah dibuat generik terhadap tipe form, bukan memakai satu tipe
 * gabungan, supaya `control` milik form tambah dan form ubah sama-sama diterima
 * tanpa melemahkan pemeriksaan tipe. Menyatukan bagian yang sama membuat label
 * dan aturannya mustahil berbeda antara menambah dan mengubah.
 */
interface DataDiriMember extends FieldValues {
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto?: string;
}

function FotoMember<T extends DataDiriMember>({
  control,
  previewUrl,
}: {
  control: Control<T>;
  previewUrl: string | null;
}) {
  return (
    <FormField
      control={control}
      name={'foto' as Path<T>}
      render={({ field }) => (
        <FormItem>
          <ImageUpload
            label="Foto member"
            keterangan="Opsional. JPG atau PNG, maksimal 2 MB."
            bentuk="bulat"
            value={(field.value as string | undefined) ?? null}
            previewUrl={previewUrl}
            unggah={unggahFotoMember}
            onChange={(filename) => field.onChange(filename ?? undefined)}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function FieldDataDiri<T extends DataDiriMember>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <>
      <FormField
        control={control}
        name={'nama_member' as Path<T>}
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
        control={control}
        name={'instansi' as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instansi</FormLabel>
            <FormControl>
              <Input placeholder="SMK Telkom Malang" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={'telp' as Path<T>}
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
        control={control}
        name={'alamat' as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alamat</FormLabel>
            <FormControl>
              <Textarea rows={2} placeholder="Jl. Contoh No. 1, Malang" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

function TombolDialog({
  sedangProses,
  onBatal,
}: {
  sedangProses: boolean;
  onBatal: () => void;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onBatal} disabled={sedangProses}>
        Batal
      </Button>
      <Button type="submit" form="form-member" disabled={sedangProses}>
        {sedangProses ? 'Menyimpan…' : 'Simpan'}
      </Button>
    </DialogFooter>
  );
}
