'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
import { ApiError } from '@/lib/api/error';
import { batalkanReservasi } from '@/lib/api/reservasi';
import { kunciTerdampakStatus } from '@/lib/query-keys';

/** Pembatalan dari halaman detail, dengan konfirmasi. */
export function TombolBatal({
  id,
  kodeBooking,
}: {
  id: number;
  kodeBooking: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [terbuka, setTerbuka] = useState(false);

  const batal = useMutation({
    mutationFn: () => batalkanReservasi(id),
    onSuccess: () => {
      setTerbuka(false);

      for (const kunci of kunciTerdampakStatus(id)) {
        void queryClient.invalidateQueries({ queryKey: kunci });
      }

      toast.success('Reservasi berhasil dibatalkan.');
      // Halaman ini dirender di server, sehingga perlu dimuat ulang agar status
      // barunya ikut berubah.
      router.refresh();
    },
    onError: (error: unknown) => {
      setTerbuka(false);
      toast.error(
        error instanceof ApiError ? error.message : 'Gagal membatalkan reservasi.',
      );
    },
  });

  return (
    <>
      <Button variant="outline" onClick={() => setTerbuka(true)}>
        Batalkan pemesanan
      </Button>

      <AlertDialog open={terbuka} onOpenChange={setTerbuka}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan pemesanan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pemesanan {kodeBooking} akan dibatalkan dan jadwalnya kembali
              terbuka untuk orang lain. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={batal.isPending}>
              Tidak jadi
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={batal.isPending}
              onClick={(e) => {
                e.preventDefault();
                batal.mutate();
              }}
            >
              {batal.isPending ? 'Membatalkan…' : 'Ya, batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
