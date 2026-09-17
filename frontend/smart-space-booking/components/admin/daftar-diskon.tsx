'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgePercent, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { DialogDiskon } from '@/components/admin/dialog-diskon';
import { TombolHapus } from '@/components/admin/tombol-hapus';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { daftarDiskonAdmin, hapusDiskon } from '@/lib/api/admin-diskon';
import { ApiError } from '@/lib/api/error';
import { waktuLengkap } from '@/lib/format';
import { qk } from '@/lib/query-keys';
import { cn } from '@/lib/utils';
import { sedangBerlaku, sudahLewat } from '@/lib/waktu-lokal';
import type { Diskon } from '@/types/entities';

/** Penanda masa berlaku, dihitung di klien karena backend tidak mengirimnya. */
function StatusBerlaku({ diskon }: { diskon: Diskon }) {
  const aktif = sedangBerlaku(diskon.tanggal_awal, diskon.tanggal_akhir);
  const lewat = sudahLewat(diskon.tanggal_akhir);

  const { label, kelas } = aktif
    ? { label: 'Berlaku', kelas: 'bg-status-berhasil-bg text-status-berhasil' }
    : lewat
      ? { label: 'Kedaluwarsa', kelas: 'bg-status-netral-bg text-status-netral' }
      : { label: 'Terjadwal', kelas: 'bg-status-menunggu-bg text-status-menunggu' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        kelas,
      )}
    >
      {label}
    </span>
  );
}

/**
 * Daftar kode promo beserta pengelolaannya.
 *
 * Backend tidak mengirim penanda aktif pada `GET /admin/diskon` (lihat keputusan
 * 28 di backend), jadi status berlakunya dihitung di sini dari rentang
 * tanggalnya. Perhitungan ini hanya menentukan yang terlihat; yang menentukan
 * promo benar-benar dapat dipakai tetap backend saat pemesanan dibuat.
 */
export function DaftarDiskon({ awal }: { awal: Diskon[] }) {
  const queryClient = useQueryClient();
  const [dialogTerbuka, setDialogTerbuka] = useState(false);
  const [sedangDiubah, setSedangDiubah] = useState<Diskon | undefined>();

  const { data: daftar } = useQuery({
    queryKey: qk.admin.diskon.all,
    queryFn: () => daftarDiskonAdmin(),
    initialData: awal,
  });

  const hapus = useMutation({
    mutationFn: (id: number) => hapusDiskon(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.admin.diskon.all });
      void queryClient.invalidateQueries({ queryKey: qk.diskon.all });
      toast.success('Diskon berhasil dihapus!');
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Gagal menghapus diskon.',
      );
    },
  });

  function bukaTambah() {
    setSedangDiubah(undefined);
    setDialogTerbuka(true);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{daftar.length} kode promo</p>

        <Button onClick={bukaTambah}>
          <Plus />
          Tambah promo
        </Button>
      </div>

      {daftar.length === 0 ? (
        <EmptyState
          icon={<BadgePercent className="size-8" />}
          judul="Belum ada kode promo"
          keterangan="Buat kode promo agar penyewa mendapat potongan harga saat memesan."
          aksi={
            <Button onClick={bukaTambah}>
              <Plus />
              Tambah promo
            </Button>
          }
        />
      ) : (
        <div className="bg-card overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead className="text-right">Potongan</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Berakhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {daftar.map((diskon) => (
                <TableRow key={diskon.id}>
                  <TableCell className="font-medium">
                    {diskon.nama_diskon}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {diskon.persentase_diskon}%
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {waktuLengkap(diskon.tanggal_awal)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {waktuLengkap(diskon.tanggal_akhir)}
                  </TableCell>
                  <TableCell>
                    <StatusBerlaku diskon={diskon} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ubah ${diskon.nama_diskon}`}
                        onClick={() => {
                          setSedangDiubah(diskon);
                          setDialogTerbuka(true);
                        }}
                      >
                        <Pencil />
                      </Button>

                      <TombolHapus
                        ikonSaja
                        labelTombol={`Hapus ${diskon.nama_diskon}`}
                        judul="Hapus kode promo ini?"
                        keterangan={
                          <>
                            <strong>{diskon.nama_diskon}</strong> tidak dapat
                            dipakai lagi pada pemesanan baru. Pemesanan yang
                            sudah memakainya tetap utuh beserta potongannya.
                          </>
                        }
                        sedangProses={hapus.isPending}
                        onHapus={() => hapus.mutate(diskon.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DialogDiskon
        terbuka={dialogTerbuka}
        onTutup={() => setDialogTerbuka(false)}
        diskon={sedangDiubah}
      />
    </>
  );
}
