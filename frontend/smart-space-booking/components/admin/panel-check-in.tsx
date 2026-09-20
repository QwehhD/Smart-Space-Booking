'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, QrCode, ScanLine, X } from 'lucide-react';
import { useState } from 'react';
import { AksiReservasi } from '@/components/admin/aksi-reservasi';
import { KartuReservasiAdmin } from '@/components/admin/kartu-reservasi-admin';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { daftarReservasiAdmin } from '@/lib/api/admin-reservasi';
import { qk } from '@/lib/query-keys';
import { tanggalDenganHari } from '@/lib/format';
import type { ReservasiAdmin, TanggalISO } from '@/types/entities';

/** Awalan payload QR pada e-ticket, disalin dari `backend/src/reservasi/reservasi.constant.ts`. */
const AWALAN_QR = 'VERIFY-RESERVASI-';

/**
 * Menerjemahkan isian menjadi pencocokan.
 *
 * Pengelola dapat mengetik kode booking, atau menempelkan hasil pindaian QR
 * e-ticket yang bentuknya `VERIFY-RESERVASI-<id>`. Keduanya diterima supaya
 * kamera ponsel biasa sudah cukup untuk memakai halaman ini, tanpa pustaka
 * pemindai apa pun.
 */
function cocok(reservasi: ReservasiAdmin, isian: string): boolean {
  const bersih = isian.trim().toUpperCase();

  if (bersih.startsWith(AWALAN_QR)) {
    return String(reservasi.id) === bersih.slice(AWALAN_QR.length);
  }

  return (
    reservasi.kode_booking.toUpperCase().includes(bersih) ||
    reservasi.member.nama_member.toUpperCase().includes(bersih)
  );
}

/**
 * Pencatatan kedatangan dan kepulangan tamu.
 *
 * Backend tidak menyediakan endpoint verifikasi QR (lihat
 * `backend/docs/KEPUTUSAN.md` nomor 47), jadi halaman ini tidak memindai apa pun
 * ke server. Yang dilakukannya adalah memuat agenda hari ini, lalu mencocokkan
 * isian dengan daftar itu di klien. Karena datanya sudah termuat, pencocokannya
 * seketika dan tetap bekerja meski jaringan sedang lambat.
 *
 * Konsekuensinya, pemesanan di luar hari ini tidak akan ditemukan di sini. Itu
 * memang diinginkan: check-in hanya sah untuk reservasi yang sudah disetujui,
 * dan backend pun dapat dipasang membatasi check-in pada tanggal sewanya lewat
 * `STRICT_CHECKIN_DATE`.
 */
export function PanelCheckIn({
  awal,
  tanggal,
}: {
  awal: ReservasiAdmin[];
  tanggal: TanggalISO;
}) {
  const [isian, setIsian] = useState('');

  const { data: agenda } = useQuery({
    queryKey: qk.admin.reservasi.list({ tanggal }),
    queryFn: () => daftarReservasiAdmin({ tanggal }),
    initialData: awal,
  });

  const kunci = isian.trim();
  const hasil = kunci ? agenda.filter((r) => cocok(r, kunci)) : [];

  // Tanpa isian, yang ditampilkan adalah tamu yang memang ditunggu hari ini.
  const menunggu = agenda.filter(
    (r) => r.status === 'disetujui' || r.status === 'aktif',
  );

  const ditampilkan = kunci ? hasil : menunggu;

  return (
    <>
      <div className="bg-card shadow-xs grid gap-3 rounded-xl border p-4">
        <label htmlFor="isian-checkin" className="text-sm font-medium">
          Kode booking atau hasil pindaian QR
        </label>

        <div className="relative">
          <ScanLine className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="isian-checkin"
            value={isian}
            onChange={(e) => setIsian(e.target.value)}
            placeholder="BOOK-20260917-0001"
            autoComplete="off"
            autoCapitalize="characters"
            className="pl-9 font-mono"
          />
          {isian ? (
            <button
              type="button"
              onClick={() => setIsian('')}
              aria-label="Hapus isian"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs">
          Pindai QR pada e-ticket dengan kamera ponsel lalu tempelkan hasilnya,
          atau ketik kode booking maupun nama tamunya.
        </p>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">
          {kunci ? 'Hasil pencarian' : 'Tamu yang ditunggu hari ini'}
        </h2>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {ditampilkan.length} pemesanan • {tanggalDenganHari(tanggal)}
        </p>
      </div>

      {ditampilkan.length === 0 ? (
        <EmptyState
          icon={
            kunci ? <QrCode className="size-8" /> : <CalendarCheck className="size-8" />
          }
          judul={kunci ? 'Tidak ditemukan' : 'Tidak ada tamu yang ditunggu'}
          keterangan={
            kunci
              ? `Tidak ada pemesanan hari ini yang cocok dengan “${kunci}”. Pencarian hanya mencakup agenda hari ini.`
              : 'Pemesanan yang sudah disetujui untuk hari ini akan muncul di sini, siap di-check-in.'
          }
          aksi={
            kunci ? (
              <Button variant="outline" onClick={() => setIsian('')}>
                Kosongkan isian
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="masuk-berurut grid gap-3 lg:grid-cols-2">
          {ditampilkan.map((reservasi) => (
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
