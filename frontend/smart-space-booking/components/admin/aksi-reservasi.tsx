'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, LogIn, LogOut, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  checkIn,
  checkOut,
  ubahStatusReservasi,
} from '@/lib/api/admin-reservasi';
import { ApiError } from '@/lib/api/error';
import { bolehCheckIn, bolehCheckOut, bolehPindahStatus } from '@/lib/constants';
import { bandingkanTanggal, hariIniWib, tanggalPendek } from '@/lib/format';
import { kunciTerdampakStatus } from '@/lib/query-keys';
import type { ReservasiAdmin } from '@/types/entities';

/**
 * Tombol aksi untuk satu pemesanan.
 *
 * Tombol yang ditampilkan mengikuti salinan mesin status di `lib/constants.ts`,
 * sehingga pengelola tidak pernah disodori tindakan yang pasti ditolak backend.
 * Salinan itu hanya menentukan apa yang terlihat; keputusan sebenarnya tetap di
 * backend, dan pesan penolakannya ditampilkan apa adanya bila ternyata berbeda.
 *
 * Check-in hanya ditawarkan pada tanggal sewanya, sama dengan aturan backend
 * (`STRICT_CHECKIN_DATE`). Di luar hari itu, yang tampil adalah keterangan
 * kapan check-in dibuka. Check-out tidak dibatasi tanggal, supaya tamu yang lupa
 * di-check-out tetap dapat ditutup keesokan harinya.
 *
 * Pembatalan diberi konfirmasi karena statusnya bersifat akhir dan tidak dapat
 * dikembalikan, sedangkan persetujuan serta check-in tidak, supaya alur di meja
 * depan tetap cepat.
 */
export function AksiReservasi({
  reservasi,
  ukuran = 'sm',
}: {
  reservasi: ReservasiAdmin;
  ukuran?: 'sm' | 'default';
}) {
  const queryClient = useQueryClient();
  const [konfirmasiBatal, setKonfirmasiBatal] = useState(false);

  function segarkan() {
    for (const kunci of kunciTerdampakStatus(reservasi.id)) {
      void queryClient.invalidateQueries({ queryKey: kunci });
    }
  }

  function tampilkanGagal(error: unknown, bawaan: string) {
    toast.error(error instanceof ApiError ? error.message : bawaan);
  }

  const setujui = useMutation({
    mutationFn: () => ubahStatusReservasi(reservasi.id, 'disetujui'),
    onSuccess: ({ message }) => {
      segarkan();
      toast.success(message);
    },
    onError: (error: unknown) => tampilkanGagal(error, 'Gagal menyetujui pemesanan.'),
  });

  const batalkan = useMutation({
    mutationFn: () => ubahStatusReservasi(reservasi.id, 'dibatalkan'),
    onSuccess: ({ message }) => {
      setKonfirmasiBatal(false);
      segarkan();
      toast.success(message);
    },
    onError: (error: unknown) => {
      setKonfirmasiBatal(false);
      tampilkanGagal(error, 'Gagal membatalkan pemesanan.');
    },
  });

  const masuk = useMutation({
    mutationFn: () => checkIn(reservasi.id),
    onSuccess: () => {
      segarkan();
      toast.success('Check-in berhasil dicatat!');
    },
    onError: (error: unknown) => tampilkanGagal(error, 'Gagal mencatat check-in.'),
  });

  const keluar = useMutation({
    mutationFn: () => checkOut(reservasi.id),
    onSuccess: () => {
      segarkan();
      toast.success('Check-out berhasil dicatat!');
    },
    onError: (error: unknown) => tampilkanGagal(error, 'Gagal mencatat check-out.'),
  });

  const sedangProses =
    setujui.isPending || batalkan.isPending || masuk.isPending || keluar.isPending;

  const bolehSetujui = bolehPindahStatus(reservasi.status, 'disetujui');
  const bolehBatalkan = bolehPindahStatus(reservasi.status, 'dibatalkan');
  const selisihHari = bandingkanTanggal(reservasi.tanggal_reservasi, hariIniWib());
  const menungguHariH = bolehCheckIn(reservasi.status) && selisihHari !== 0;
  const bolehMasuk = bolehCheckIn(reservasi.status) && selisihHari === 0;
  const bolehKeluar = bolehCheckOut(reservasi.status);

  // Status akhir tidak menyisakan tindakan apa pun.
  if (
    !bolehSetujui &&
    !bolehBatalkan &&
    !bolehMasuk &&
    !bolehKeluar &&
    !menungguHariH
  ) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {menungguHariH ? (
          <p className="text-muted-foreground text-xs">
            {selisihHari > 0
              ? `Check-in dibuka ${tanggalPendek(reservasi.tanggal_reservasi)}`
              : 'Tanggal sewa sudah lewat'}
          </p>
        ) : null}

        {bolehSetujui ? (
          <Button
            size={ukuran}
            disabled={sedangProses}
            onClick={() => setujui.mutate()}
          >
            <Check />
            Setujui
          </Button>
        ) : null}

        {bolehMasuk ? (
          <Button
            size={ukuran}
            disabled={sedangProses}
            onClick={() => masuk.mutate()}
          >
            <LogIn />
            Check-in
          </Button>
        ) : null}

        {bolehKeluar ? (
          <Button
            size={ukuran}
            disabled={sedangProses}
            onClick={() => keluar.mutate()}
          >
            <LogOut />
            Check-out
          </Button>
        ) : null}

        {bolehBatalkan ? (
          <Button
            size={ukuran}
            variant="outline"
            disabled={sedangProses}
            onClick={() => setKonfirmasiBatal(true)}
          >
            <X />
            Batalkan
          </Button>
        ) : null}
      </div>

      <AlertDialog open={konfirmasiBatal} onOpenChange={setKonfirmasiBatal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan pemesanan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pemesanan {reservasi.kode_booking} atas nama{' '}
              {reservasi.member.nama_member} akan dibatalkan dan jadwalnya kembali
              terbuka. Status batal bersifat akhir dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={batalkan.isPending}>
              Tidak jadi
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={batalkan.isPending}
              onClick={(e) => {
                e.preventDefault();
                batalkan.mutate();
              }}
            >
              {batalkan.isPending ? 'Membatalkan…' : 'Ya, batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
