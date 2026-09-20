'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Pencil, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DialogSpace } from '@/components/admin/dialog-space';
import { TombolHapus } from '@/components/admin/tombol-hapus';
import { EmptyState } from '@/components/shared/empty-state';
import { Rupiah } from '@/components/shared/rupiah';
import { SpaceImage } from '@/components/shared/space-image';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { Button } from '@/components/ui/button';
import { daftarSpaceAdmin, hapusSpace } from '@/lib/api/admin-spaces';
import { ApiError } from '@/lib/api/error';
import { qk } from '@/lib/query-keys';
import type { Space } from '@/types/entities';

/**
 * Daftar ruangan beserta pengelolaannya.
 *
 * Data awalnya sudah diambil Server Component dan diteruskan sebagai
 * `initialData`, sehingga daftarnya langsung terlihat pada render pertama
 * sekaligus tetap berada di cache TanStack Query agar setiap mutasi cukup
 * membatalkan kuncinya, tanpa memuat ulang seluruh halaman.
 */
export function DaftarSpace({ awal }: { awal: Space[] }) {
  const queryClient = useQueryClient();
  const [dialogTerbuka, setDialogTerbuka] = useState(false);
  const [sedangDiubah, setSedangDiubah] = useState<Space | undefined>();

  const { data: spaces } = useQuery({
    queryKey: qk.admin.spaces.all,
    queryFn: () => daftarSpaceAdmin(),
    initialData: awal,
  });

  const hapus = useMutation({
    mutationFn: (id: number) => hapusSpace(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.spaces.all });
      void queryClient.invalidateQueries({ queryKey: qk.spaces.all });
      toast.success('Space berhasil dihapus!');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Gagal menghapus space.',
      );
    },
  });

  function bukaTambah() {
    setSedangDiubah(undefined);
    setDialogTerbuka(true);
  }

  function bukaUbah(space: Space) {
    setSedangDiubah(space);
    setDialogTerbuka(true);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {spaces.length} ruangan aktif
        </p>

        <Button onClick={bukaTambah}>
          <Plus />
          Tambah space
        </Button>
      </div>

      {spaces.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="size-8" />}
          judul="Belum ada ruangan"
          keterangan="Tambahkan ruangan atau meja agar calon penyewa dapat memesannya."
          aksi={
            <Button onClick={bukaTambah}>
              <Plus />
              Tambah space
            </Button>
          }
        />
      ) : (
        <ul className="masuk-berurut grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {spaces.map((space) => (
            <li
              key={space.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/75 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className="relative overflow-hidden">
                <SpaceImage
                  url={space.foto_url}
                  nama={space.nama_space}
                  className="aspect-[16/9] w-full max-w-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
                <div className="absolute top-3 right-3 z-10">
                  <TipeBadge tipe={space.tipe} className="shadow-md backdrop-blur-md" />
                </div>
              </div>

              <div className="grid flex-1 gap-2 p-5">
                <h2 className="leading-snug font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {space.nama_space}
                </h2>

                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {space.deskripsi}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <div className="grid">
                    <Rupiah nilai={space.harga_per_jam} className="text-base font-bold text-foreground" />
                    <span className="text-muted-foreground text-[10px]">per jam</span>
                  </div>

                  <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
                    <Users className="size-3.5" />
                    {space.kapasitas} orang
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 border-t border-border/60 bg-muted/20 px-3 py-2">
                <Button variant="ghost" size="sm" className="font-semibold text-xs" onClick={() => bukaUbah(space)}>
                  <Pencil className="size-3.5" />
                  Ubah
                </Button>

                <TombolHapus
                  judul="Hapus space ini?"
                  keterangan={
                    <>
                      <strong>{space.nama_space}</strong> akan hilang dari katalog
                      dan tidak dapat dipesan lagi. Reservasi yang sudah ada tetap
                      tersimpan beserta riwayatnya.
                    </>
                  }
                  sedangProses={hapus.isPending}
                  onHapus={() => hapus.mutate(space.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <DialogSpace
        terbuka={dialogTerbuka}
        onTutup={() => setDialogTerbuka(false)}
        space={sedangDiubah}
      />
    </>
  );
}
