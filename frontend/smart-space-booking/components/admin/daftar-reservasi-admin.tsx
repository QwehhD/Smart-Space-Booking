'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarX, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AksiReservasi } from '@/components/admin/aksi-reservasi';
import { KartuReservasiAdmin } from '@/components/admin/kartu-reservasi-admin';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  daftarReservasiAdmin,
  type FilterReservasiAdmin,
} from '@/lib/api/admin-reservasi';
import { LABEL_STATUS, URUTAN_STATUS } from '@/lib/constants';
import { DAFTAR_BULAN } from '@/lib/format';
import { qk } from '@/lib/query-keys';
import { cn } from '@/lib/utils';
import type { ReservasiAdmin, Space, StatusReservasi } from '@/types/entities';

const SEMUA = 'semua';

/** Rentang tahun yang ditawarkan, sama seperti pada MonthPicker. */
const MUNDUR = 2;
const MAJU = 1;

/**
 * Daftar pemesanan pada panel pengelola.
 *
 * Status dan space disaring di backend lewat parameter yang memang tersedia,
 * sedangkan pencarian kode booking dan nama tamu disaring di klien karena
 * backend tidak menyediakan parameter untuk itu (lihat `lib/api/admin-reservasi.ts`).
 * Penyaringan di klien ini bekerja atas data yang sudah dimuat, jadi hasilnya
 * terbatas pada rentang yang sedang ditampilkan, bukan seluruh riwayat.
 *
 * Nilai filter disimpan di URL supaya tampilan tertentu dapat ditautkan; kotak
 * pencarian juga, sehingga tautan dari dashboard yang membawa `?kode=` langsung
 * menyorot pemesanan yang dimaksud.
 *
 * Penyaringan per bulan diwajibkan Gambar Kerja butir Admin nomor 8. Bawaannya
 * "Semua bulan" karena pengelola lebih sering mencari pemesanan yang sedang
 * berjalan daripada merekap satu bulan tertentu; rekap bulanan sendiri sudah
 * punya halamannya sendiri di `/admin/laporan`.
 */
export function DaftarReservasiAdmin({
  awal,
  filter,
  spaces,
  kodeAwal,
}: {
  awal: ReservasiAdmin[];
  filter: FilterReservasiAdmin;
  spaces: Space[];
  kodeAwal: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [teks, setTeks] = useState(kodeAwal);

  const tahunIni = new Date().getFullYear();
  const pilihanTahun = Array.from(
    { length: MUNDUR + MAJU + 1 },
    (_, i) => tahunIni - MUNDUR + i,
  );

  const { data: daftar } = useQuery({
    queryKey: qk.admin.reservasi.list(filter),
    queryFn: () => daftarReservasiAdmin(filter),
    initialData: awal,
  });

  function ubahUrl(ubahan: Record<string, string | null>) {
    const baru = new URLSearchParams(params.toString());

    for (const [kunci, nilai] of Object.entries(ubahan)) {
      if (nilai) {
        baru.set(kunci, nilai);
      } else {
        baru.delete(kunci);
      }
    }

    const query = baru.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  const kunci = teks.trim().toLowerCase();
  const terlihat = kunci
    ? daftar.filter(
        (r) =>
          r.kode_booking.toLowerCase().includes(kunci) ||
          r.member.nama_member.toLowerCase().includes(kunci),
      )
    : daftar;

  return (
    <>
      <div className="grid gap-3">
        <div
          role="tablist"
          aria-label="Filter status"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        >
          {[SEMUA, ...URUTAN_STATUS].map((status) => {
            const aktif = (filter.status ?? SEMUA) === status;

            return (
              <Button
                key={status}
                role="tab"
                aria-selected={aktif}
                size="sm"
                variant={aktif ? 'default' : 'outline'}
                className="shrink-0"
                onClick={() =>
                  ubahUrl({ status: status === SEMUA ? null : status })
                }
              >
                {status === SEMUA
                  ? 'Semua'
                  : LABEL_STATUS[status as StatusReservasi]}
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              onBlur={() => ubahUrl({ kode: teks.trim() || null })}
              placeholder="Cari kode booking atau nama tamu…"
              aria-label="Cari pemesanan"
              className="pl-9"
            />
            {teks ? (
              <button
                type="button"
                onClick={() => {
                  setTeks('');
                  ubahUrl({ kode: null });
                }}
                aria-label="Hapus pencarian"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <Select
            value={filter.id_space ? String(filter.id_space) : SEMUA}
            onValueChange={(nilai) =>
              nilai && ubahUrl({ id_space: nilai === SEMUA ? null : nilai })
            }
          >
            <SelectTrigger className="w-[13rem]" aria-label="Filter space">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua space</SelectItem>
              {spaces.map((space) => (
                <SelectItem key={space.id} value={String(space.id)}>
                  {space.nama_space}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.month ? String(filter.month) : SEMUA}
            onValueChange={(nilai) => {
              if (!nilai) {
                return;
              }

              // Bulan tanpa tahun akan ditolak backend, jadi keduanya selalu
              // disetel dan dibersihkan bersama-sama.
              ubahUrl(
                nilai === SEMUA
                  ? { month: null, year: null }
                  : { month: nilai, year: String(filter.year ?? tahunIni) },
              );
            }}
          >
            <SelectTrigger className="w-[10rem]" aria-label="Filter bulan">
              <SelectValue>
                {() =>
                  filter.month
                    ? (DAFTAR_BULAN[filter.month - 1]?.nama ?? 'Semua bulan')
                    : 'Semua bulan'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA}>Semua bulan</SelectItem>
              {DAFTAR_BULAN.map((bulan) => (
                <SelectItem key={bulan.nilai} value={String(bulan.nilai)}>
                  {bulan.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {filter.month ? (
            <Select
              value={String(filter.year ?? tahunIni)}
              onValueChange={(nilai) => nilai && ubahUrl({ year: nilai })}
            >
              <SelectTrigger className="w-[6.5rem]" aria-label="Filter tahun">
                <SelectValue>{() => filter.year ?? tahunIni}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pilihanTahun.map((tahun) => (
                  <SelectItem key={tahun} value={String(tahun)}>
                    {tahun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      <p className={cn('text-muted-foreground text-sm')} aria-live="polite">
        {terlihat.length} pemesanan
        {kunci ? ` cocok dengan “${teks.trim()}”` : ''}
      </p>

      {terlihat.length === 0 ? (
        <EmptyState
          icon={<CalendarX className="size-8" />}
          judul={kunci ? 'Tidak ada yang cocok' : 'Belum ada pemesanan'}
          keterangan={
            kunci
              ? 'Pencarian hanya mencakup pemesanan yang sedang ditampilkan. Longgarkan filternya lalu coba lagi.'
              : 'Pemesanan yang masuk akan muncul di sini beserta tombol persetujuannya.'
          }
          aksi={
            kunci ? (
              <Button
                variant="outline"
                onClick={() => {
                  setTeks('');
                  ubahUrl({ kode: null });
                }}
              >
                Kosongkan pencarian
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="masuk-berurut grid gap-3 lg:grid-cols-2">
          {terlihat.map((reservasi) => (
            <li key={reservasi.id}>
              <KartuReservasiAdmin
                reservasi={reservasi}
                aksi={<AksiReservasi reservasi={reservasi} />}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
