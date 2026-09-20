'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarX, Inbox } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ReservasiCard } from '@/components/member/reservasi-card';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/error';
import { batalkanReservasi, reservasiSaya } from '@/lib/api/reservasi';
import { bolehDibatalkanMember, LABEL_STATUS, URUTAN_STATUS } from '@/lib/constants';
import { kunciTerdampakStatus, qk } from '@/lib/query-keys';
import { cn } from '@/lib/utils';
import type { ReservasiRingkas, StatusReservasi } from '@/types/entities';

const SEMUA = 'semua';

/**
 * Daftar pemesanan milik member, dengan tab status.
 *
 * Penyaringannya dilakukan di klien karena backend tidak menyediakan parameter
 * status pada `GET /api/reservasi/my`, dan seluruh pemesanan satu member memang
 * dimuat sekaligus. Tab aktif disimpan di URL supaya dapat ditautkan.
 */
export function DaftarReservasi() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [akanDibatalkan, setAkanDibatalkan] = useState<ReservasiRingkas | null>(null);

  const status = params.get('status');
  const tabAktif =
    status && (URUTAN_STATUS as string[]).includes(status)
      ? (status as StatusReservasi)
      : SEMUA;

  const daftar = useQuery({
    queryKey: qk.reservasi.milikSaya,
    queryFn: () => reservasiSaya(),
  });

  const batal = useMutation({
    mutationFn: (id: number) => batalkanReservasi(id),
    onSuccess: (_, id) => {
      setAkanDibatalkan(null);
      for (const kunci of kunciTerdampakStatus(id)) {
        void queryClient.invalidateQueries({ queryKey: kunci });
      }
      toast.success('Reservasi berhasil dibatalkan.');
    },
    onError: (error: unknown) => {
      setAkanDibatalkan(null);
      toast.error(
        error instanceof ApiError ? error.message : 'Gagal membatalkan reservasi.',
      );
    },
  });

  function pilihTab(nilai: string) {
    const baru = new URLSearchParams(params.toString());

    if (nilai === SEMUA) {
      baru.delete('status');
    } else {
      baru.set('status', nilai);
    }

    const query = baru.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const semua = daftar.data ?? [];
  const terlihat =
    tabAktif === SEMUA ? semua : semua.filter((r) => r.status === tabAktif);

  return (
    <div className="grid gap-4">
      <div
        role="tablist"
        aria-label="Filter status pemesanan"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0"
      >
        {[SEMUA, ...URUTAN_STATUS].map((nilai) => {
          const aktif = tabAktif === nilai;
          const jumlah =
            nilai === SEMUA
              ? semua.length
              : semua.filter((r) => r.status === nilai).length;

          return (
            <Button
              key={nilai}
              role="tab"
              aria-selected={aktif}
              size="sm"
              variant={aktif ? 'default' : 'outline'}
              className={cn(
                'rounded-full shrink-0 font-semibold text-xs transition-all',
                aktif && 'shadow-xs',
              )}
              onClick={() => pilihTab(nilai)}
            >
              <span>{nilai === SEMUA ? 'Semua' : LABEL_STATUS[nilai as StatusReservasi]}</span>
              {daftar.isSuccess ? (
                <span
                  className={cn(
                    'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                    aktif
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {jumlah}
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>

      {daftar.isLoading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : daftar.isError ? (
        <ErrorState error={daftar.error} onCobaLagi={() => void daftar.refetch()} />
      ) : terlihat.length === 0 ? (
        <EmptyState
          icon={tabAktif === SEMUA ? <Inbox className="size-8" /> : <CalendarX className="size-8" />}
          judul={
            tabAktif === SEMUA
              ? 'Belum ada pemesanan'
              : `Tidak ada pemesanan berstatus ${LABEL_STATUS[tabAktif as StatusReservasi]}`
          }
          keterangan={
            tabAktif === SEMUA
              ? 'Pemesanan yang kamu buat akan muncul di sini.'
              : 'Coba pilih tab status yang lain.'
          }
          aksi={
            tabAktif === SEMUA ? (
              <Button size="sm" render={<Link href="/spaces">Cari space</Link>} />
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {terlihat.map((reservasi) => (
            <ReservasiCard
              key={reservasi.id}
              reservasi={reservasi}
              aksi={
                bolehDibatalkanMember(reservasi.status) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAkanDibatalkan(reservasi)}
                  >
                    Batalkan
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/reservasi/${reservasi.id}`}>Detail</Link>}
                  />
                )
              }
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={akanDibatalkan !== null}
        onOpenChange={(terbuka) => !terbuka && setAkanDibatalkan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan pemesanan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pemesanan {akanDibatalkan?.kode_booking} akan dibatalkan dan
              jadwalnya kembali terbuka untuk orang lain. Tindakan ini tidak dapat
              dibatalkan.
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

                if (akanDibatalkan) {
                  batal.mutate(akanDibatalkan.id);
                }
              }}
            >
              {batal.isPending ? 'Membatalkan…' : 'Ya, batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
