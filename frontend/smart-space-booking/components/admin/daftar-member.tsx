'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Users, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DialogMember } from '@/components/admin/dialog-member';
import { TombolHapus } from '@/components/admin/tombol-hapus';
import { EmptyState } from '@/components/shared/empty-state';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { daftarMember, hapusMember } from '@/lib/api/admin-members';
import { ApiError } from '@/lib/api/error';
import { inisial } from '@/lib/format';
import { qk } from '@/lib/query-keys';
import { useDebounced } from '@/lib/use-debounced';
import type { Member } from '@/types/entities';

/**
 * Daftar member beserta pengelolaannya.
 *
 * Pencariannya dikirim ke backend lewat `?search`, bukan disaring di klien,
 * karena backend sudah menyediakannya dan mencari di sana mencakup seluruh
 * member, bukan hanya yang kebetulan sudah termuat. Ketikan ditunda sejenak agar
 * tidak mengirim satu request per huruf.
 *
 * Perlu dicatat bahwa daftar member bersifat global, bukan per pengelola (lihat
 * keputusan 30 di backend): member mendaftar ke aplikasi, bukan ke satu lokasi,
 * dan dapat memesan space milik pengelola mana pun.
 */
export function DaftarMember({ awal }: { awal: Member[] }) {
  const queryClient = useQueryClient();
  const [teks, setTeks] = useState('');
  const pencarian = useDebounced(teks.trim());

  const [dialogTerbuka, setDialogTerbuka] = useState(false);
  const [sedangDiubah, setSedangDiubah] = useState<Member | undefined>();

  const { data: members, isFetching } = useQuery({
    queryKey: qk.admin.members.list(pencarian),
    queryFn: () => daftarMember(pencarian || undefined),
    // Data dari server hanya cocok untuk daftar tanpa pencarian.
    initialData: pencarian === '' ? awal : undefined,
    placeholderData: (sebelumnya) => sebelumnya,
  });

  const hapus = useMutation({
    mutationFn: (id: number) => hapusMember(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.members.all });
      toast.success('Member berhasil dihapus!');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Gagal menghapus member.',
      );
    },
  });

  function bukaTambah() {
    setSedangDiubah(undefined);
    setDialogTerbuka(true);
  }

  const daftar = members ?? [];

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="Cari nama, instansi, atau nomor telepon…"
            aria-label="Cari member"
            className="pl-9"
          />
          {teks ? (
            <button
              type="button"
              onClick={() => setTeks('')}
              aria-label="Hapus pencarian"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <Button onClick={bukaTambah}>
          <Plus />
          Tambah member
        </Button>
      </div>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {isFetching ? 'Mencari…' : `${daftar.length} member`}
        {pencarian ? ` untuk “${pencarian}”` : ''}
      </p>

      {daftar.length === 0 ? (
        <EmptyState
          icon={<Users className="size-8" />}
          judul={pencarian ? 'Tidak ada yang cocok' : 'Belum ada member'}
          keterangan={
            pencarian
              ? 'Coba kata kunci lain, atau kosongkan pencarian untuk melihat semuanya.'
              : 'Member yang mendaftar sendiri akan muncul di sini, dan kamu juga dapat menambahkannya.'
          }
          aksi={
            pencarian ? (
              <Button variant="outline" onClick={() => setTeks('')}>
                Kosongkan pencarian
              </Button>
            ) : (
              <Button onClick={bukaTambah}>
                <Plus />
                Tambah member
              </Button>
            )
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {daftar.map((member) => (
            <li key={member.id} className="bg-card grid gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 shrink-0">
                  {member.foto_url ? (
                    <AvatarImage src={member.foto_url} alt={member.nama_member} />
                  ) : null}
                  <AvatarFallback>{inisial(member.nama_member)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate font-medium">{member.nama_member}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {member.instansi}
                  </p>
                </div>
              </div>

              <dl className="grid gap-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground shrink-0">Telepon</dt>
                  <dd className="ml-auto truncate">{member.telp}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground shrink-0">Alamat</dt>
                  <dd className="ml-auto truncate text-right">{member.alamat}</dd>
                </div>
              </dl>

              <div className="flex items-center justify-end gap-1 border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSedangDiubah(member);
                    setDialogTerbuka(true);
                  }}
                >
                  <Pencil />
                  Ubah
                </Button>

                <TombolHapus
                  judul="Hapus member ini?"
                  keterangan={
                    <>
                      <strong>{member.nama_member}</strong> tidak dapat masuk lagi
                      dan hilang dari daftar. Reservasi yang pernah dibuatnya
                      tetap tersimpan beserta riwayatnya.
                    </>
                  }
                  sedangProses={hapus.isPending}
                  onHapus={() => hapus.mutate(member.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <DialogMember
        terbuka={dialogTerbuka}
        onTutup={() => setDialogTerbuka(false)}
        member={sedangDiubah}
      />
    </>
  );
}
