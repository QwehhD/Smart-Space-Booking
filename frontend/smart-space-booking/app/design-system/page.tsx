import { notFound } from 'next/navigation';
import { CalendarDays, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Rupiah } from '@/components/shared/rupiah';
import { StatusBadge } from '@/components/shared/status-badge';
import { TipeBadge } from '@/components/shared/tipe-badge';
import { URUTAN_STATUS, URUTAN_TIPE } from '@/lib/constants';
import {
  namaBulan,
  rupiahRingkas,
  tanggalDanJam,
  tanggalDenganHari,
  waktuLengkap,
} from '@/lib/format';
import { hitungRincian } from '@/lib/pricing';

/**
 * Katalog token dan komponen, hanya tersedia saat pengembangan.
 *
 * Halaman ini bukan bagian dari aplikasi yang dipakai pengguna; gunanya untuk
 * memeriksa warna, tipografi, dan komponen dalam satu tampilan, termasuk saat
 * mendemonstrasikan design system-nya.
 */
export const metadata = { title: 'Design System' };

const WARNA_DASAR = [
  ['background', 'bg-background'],
  ['foreground', 'bg-foreground'],
  ['primary', 'bg-primary'],
  ['secondary', 'bg-secondary'],
  ['muted', 'bg-muted'],
  ['accent', 'bg-accent'],
  ['destructive', 'bg-destructive'],
  ['border', 'bg-border'],
] as const;

const WARNA_GRAFIK = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
] as const;

export default function DesignSystemPage() {
  // Halaman internal, tidak boleh ikut terbit pada build produksi.
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const contohHarga = hitungRincian(20000, 3, 20);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="border-b pb-6">
        <p className="text-primary font-mono text-xs tracking-widest uppercase">
          Internal · hanya mode pengembangan
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Design System
        </h1>
        <p className="text-muted-foreground mt-2 max-w-prose text-sm">
          Token warna, tipografi, dan komponen yang dipakai seluruh aplikasi.
          Palet dasarnya netral mengikuti wireframe, dengan satu warna aksen.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Warna dasar</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {WARNA_DASAR.map(([nama, kelas]) => (
            <div key={nama} className="grid gap-2">
              <div className={`${kelas} h-14 rounded-md border`} />
              <code className="text-muted-foreground text-xs">{nama}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Warna grafik</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Dipakai grafik pendapatan harian dan distribusi per tipe space.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {WARNA_GRAFIK.map((kelas, i) => (
            <div key={kelas} className="grid gap-2">
              <div className={`${kelas} size-14 rounded-md border`} />
              <code className="text-muted-foreground text-xs">chart-{i + 1}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Status reservasi</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Lima status dari backend. Warnanya sama di seluruh halaman.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {URUTAN_STATUS.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Tipe space</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {URUTAN_TIPE.map((tipe) => (
            <TipeBadge key={tipe} tipe={tipe} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Tipografi</h2>
        <div className="mt-4 grid gap-3">
          <p className="text-3xl font-semibold tracking-tight">
            Judul halaman, 3xl semibold
          </p>
          <p className="text-lg font-semibold">Judul bagian, lg semibold</p>
          <p className="text-base">
            Teks isi. Panjang baris dijaga agar nyaman dibaca, dan seluruh teks
            antarmuka memakai Bahasa Indonesia.
          </p>
          <p className="text-muted-foreground text-sm">
            Teks pendukung, sm muted.
          </p>
          <code className="bg-muted w-fit rounded px-2 py-1 font-mono text-sm">
            BOOK-20260830-0012
          </code>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Format</h2>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">Rupiah</dt>
            <dd><Rupiah nilai={360000} /></dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">Rupiah ringkas</dt>
            <dd className="tabular-nums">{rupiahRingkas(1850000)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">Tanggal</dt>
            <dd>{tanggalDenganHari('2026-05-24')}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">Tanggal dan jam</dt>
            <dd>{tanggalDanJam('2026-05-24', '09:00', '12:00')}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">Bulan</dt>
            <dd>{namaBulan(8, 2026)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b py-1.5">
            <dt className="text-muted-foreground">Waktu penuh (WIB)</dt>
            <dd>{waktuLengkap('2026-08-30T02:02:15.000Z')}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Perhitungan harga</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Rumusnya sama persis dengan backend, termasuk pembulatan potongan ke
          bawah. 20.000 per jam, 3 jam, diskon 20 persen.
        </p>
        <Card className="mt-4 max-w-sm">
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <Rupiah nilai={contohHarga.tarif_kotor} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Diskon {contohHarga.persentase_diskon}%
              </span>
              <span className="text-status-berhasil tabular-nums">
                −<Rupiah nilai={contohHarga.potongan} />
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total bayar</span>
              <Rupiah nilai={contohHarga.total_bayar} />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Komponen</h2>

        <div className="mt-4 grid gap-6">
          <div className="grid gap-2">
            <p className="text-muted-foreground text-sm">Tombol</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button>Pesan Sekarang</Button>
              <Button variant="secondary">Simpan Perubahan</Button>
              <Button variant="outline">Batal</Button>
              <Button variant="destructive">Hapus</Button>
              <Button variant="ghost">Lihat detail</Button>
              <Button disabled>Memproses…</Button>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-muted-foreground text-sm">Badge bawaan</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Baru</Badge>
              <Badge variant="secondary">Kapasitas 8</Badge>
              <Badge variant="outline">Promo</Badge>
              <Badge variant="destructive">Penuh</Badge>
            </div>
          </div>

          <div className="grid max-w-sm gap-2">
            <Label htmlFor="ds-contoh">Nama space</Label>
            <Input id="ds-contoh" placeholder="Personal Desk Alpha 01" />
            <p className="text-muted-foreground text-xs">
              Teks bantuan di bawah input.
            </p>
          </div>

          <div className="grid gap-2">
            <p className="text-muted-foreground text-sm">Kartu</p>
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Personal Desk - Flexi 01</CardTitle>
                <CardDescription>Moklet Hub Coworking Space</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <TipeBadge tipe="desk" />
                <Rupiah nilai={20000} className="font-semibold" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-2">
            <p className="text-muted-foreground text-sm">Memuat</p>
            <div className="grid max-w-sm gap-2">
              <Skeleton className="h-28 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-muted-foreground text-sm">Keadaan kosong</p>
            <EmptyState
              icon={<Inbox className="size-8" />}
              judul="Belum ada reservasi"
              keterangan="Pemesanan yang kamu buat akan muncul di sini."
              aksi={
                <Button size="sm">
                  <CalendarDays />
                  Cari space
                </Button>
              }
              className="max-w-md"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
