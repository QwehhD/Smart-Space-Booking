'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DAFTAR_BULAN } from '@/lib/format';

/** Rentang tahun yang ditawarkan, berpusat pada tahun berjalan. */
const MUNDUR = 2;
const MAJU = 1;

/**
 * Pemilih bulan dan tahun.
 *
 * Nilainya disimpan pada URL supaya laporan atau histori bulan tertentu dapat
 * ditautkan dan bertahan saat halaman dimuat ulang. Halaman yang memakainya
 * membaca parameter itu di server.
 */
export function MonthPicker({
  month,
  year,
}: {
  month: number;
  year: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const tahunIni = new Date().getFullYear();
  const pilihanTahun = Array.from(
    { length: MUNDUR + MAJU + 1 },
    (_, i) => tahunIni - MUNDUR + i,
  );

  function ubah(kunci: 'month' | 'year', nilai: string) {
    const baru = new URLSearchParams(params.toString());
    baru.set(kunci, nilai);
    router.replace(`${pathname}?${baru.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <Select
        value={String(month)}
        onValueChange={(nilai) => nilai && ubah('month', nilai)}
      >
        <SelectTrigger className="w-[9.5rem]" aria-label="Pilih bulan">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DAFTAR_BULAN.map((bulan) => (
            <SelectItem key={bulan.nilai} value={String(bulan.nilai)}>
              {bulan.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(nilai) => nilai && ubah('year', nilai)}
      >
        <SelectTrigger className="w-[6.5rem]" aria-label="Pilih tahun">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pilihanTahun.map((tahun) => (
            <SelectItem key={tahun} value={String(tahun)}>
              {tahun}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
