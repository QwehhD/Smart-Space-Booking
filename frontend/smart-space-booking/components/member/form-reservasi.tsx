'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  Loader2,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PilihPromo,
  type PromoTerpilih,
} from '@/components/member/pilih-promo';
import { RingkasanHarga } from '@/components/member/ringkasan-harga';
import { Rupiah } from '@/components/shared/rupiah';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError, applyFieldErrors } from '@/lib/api/error';
import { buatReservasi } from '@/lib/api/reservasi';
import { cekKetersediaan } from '@/lib/api/spaces';
import { tanggalDanJam } from '@/lib/format';
import {
  hitungJamSelesai,
  pilihanDurasi,
  pilihanJamMulai,
  tanggalPalingAwal,
} from '@/lib/jadwal';
import { hitungRincian } from '@/lib/pricing';
import { qk } from '@/lib/query-keys';
import { useDebounced } from '@/lib/use-debounced';
import {
  skemaReservasi,
  type NilaiReservasi,
} from '@/lib/validations/reservasi';
import type { ReservasiBaru, SpacePublik } from '@/types/entities';

const FIELD_BACKEND = ['tanggal_reservasi', 'jam_mulai', 'durasi_jam'] as const;

/**
 * Form pemesanan space.
 *
 * Ketersediaan diperiksa ke backend setiap kali tanggal, jam, atau durasi
 * berubah, dengan jeda singkat supaya tidak satu request per perubahan. Tombol
 * lanjut baru aktif setelah backend menyatakan jadwalnya kosong, sehingga
 * pengguna tidak sampai ke dialog konfirmasi untuk jadwal yang pasti ditolak.
 */
export function FormReservasi({ space }: { space: SpacePublik }) {
  const queryClient = useQueryClient();
  const [promo, setPromo] = useState<PromoTerpilih | null>(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [berhasil, setBerhasil] = useState<ReservasiBaru | null>(null);

  const hariIni = tanggalPalingAwal();
  const jamAwal = pilihanJamMulai(hariIni);

  const form = useForm<NilaiReservasi>({
    resolver: zodResolver(skemaReservasi),
    defaultValues: {
      tanggal_reservasi: hariIni,
      jam_mulai: jamAwal[0] ?? '',
      durasi_jam: 1,
    },
  });

  // useWatch berlangganan per field, dan tidak seperti form.watch() hasilnya
  // dapat dimemoisasi React Compiler.
  const tanggal = useWatch({ control: form.control, name: 'tanggal_reservasi' });
  const jamMulai = useWatch({ control: form.control, name: 'jam_mulai' });
  const durasi = useWatch({ control: form.control, name: 'durasi_jam' });

  const opsiJam = pilihanJamMulai(tanggal);
  const opsiDurasi = pilihanDurasi(jamMulai || '00:00');

  // Nilai yang dipakai memeriksa ketersediaan sengaja tertunda, sedangkan
  // tampilan ringkasan harga tetap mengikuti nilai terkini agar terasa responsif.
  const tertunda = useDebounced({ tanggal, jamMulai, durasi });
  const siapDicek =
    Boolean(tertunda.tanggal && tertunda.jamMulai && tertunda.durasi) &&
    opsiJam.includes(tertunda.jamMulai);

  const ketersediaan = useQuery({
    queryKey: qk.spaces.ketersediaan(
      space.id,
      tertunda.tanggal,
      tertunda.jamMulai,
      tertunda.durasi,
    ),
    queryFn: () =>
      cekKetersediaan({
        id_space: space.id,
        tanggal: tertunda.tanggal,
        jam_mulai: tertunda.jamMulai,
        durasi_jam: tertunda.durasi,
      }),
    enabled: siapDicek,
    // Jadwal dapat terisi orang lain kapan saja, jadi hasilnya tidak disimpan lama.
    staleTime: 0,
    retry: false,
  });

  const tersedia = ketersediaan.isSuccess;
  const pesanBentrok =
    ketersediaan.error instanceof ApiError ? ketersediaan.error.message : null;

  const rincian = hitungRincian(
    space.harga_per_jam,
    durasi || 1,
    promo?.persentase_diskon ?? 0,
  );

  const mutasi = useMutation({
    mutationFn: (nilai: NilaiReservasi) =>
      buatReservasi({
        id_space: space.id,
        tanggal_reservasi: nilai.tanggal_reservasi,
        jam_mulai: nilai.jam_mulai,
        durasi_jam: nilai.durasi_jam,
        ...(promo?.id_diskon ? { id_diskon: promo.id_diskon } : {}),
        ...(promo?.kode_promo ? { kode_promo: promo.kode_promo } : {}),
      }),
    onSuccess: (hasil) => {
      setKonfirmasi(false);
      setBerhasil(hasil);
      void queryClient.invalidateQueries({ queryKey: qk.reservasi.all });
      toast.success('Reservasi berhasil dibuat!');
    },
    onError: (error: unknown) => {
      setKonfirmasi(false);
      const terpasang = applyFieldErrors(error, form.setError, FIELD_BACKEND);

      if (!terpasang) {
        toast.error(
          error instanceof ApiError ? error.message : 'Pemesanan gagal.',
        );
      }
    },
  });

  if (berhasil) {
    return <PemesananBerhasil hasil={berhasil} namaSpace={space.nama_space} />;
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => setKonfirmasi(true))}
          className="grid gap-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="tanggal_reservasi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={hariIni}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);

                      // Jam yang sudah lewat bisa hilang dari pilihan saat
                      // tanggalnya berubah ke hari ini, jadi pilihannya disegarkan.
                      const jamBaru = pilihanJamMulai(e.target.value);

                      if (!jamBaru.includes(form.getValues('jam_mulai'))) {
                        form.setValue('jam_mulai', jamBaru[0] ?? '');
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="jam_mulai"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam mulai</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(nilai) => {
                      // base-ui mengirim null saat pilihan dikosongkan.
                      if (!nilai) {
                        return;
                      }

                      field.onChange(nilai);

                      // Durasi lama bisa melewati jam tutup untuk jam mulai baru.
                      const maks = pilihanDurasi(nilai).length;

                      if (form.getValues('durasi_jam') > maks) {
                        form.setValue('durasi_jam', maks || 1);
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {opsiJam.map((jam) => (
                        <SelectItem key={jam} value={jam}>
                          {jam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durasi_jam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durasi</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(nilai) => {
                      if (nilai) {
                        field.onChange(Number(nilai));
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih durasi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {opsiDurasi.map((jam) => (
                        <SelectItem key={jam} value={String(jam)}>
                          {jam} jam
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {opsiJam.length === 0 ? (
            <p className="text-status-menunggu bg-status-menunggu-bg rounded-md px-3 py-2 text-sm">
              Jam operasional hari ini sudah lewat. Pilih tanggal lain.
            </p>
          ) : (
            <StatusKetersediaan
              memuat={ketersediaan.isFetching}
              tersedia={tersedia}
              pesanBentrok={pesanBentrok}
              jamMulai={jamMulai}
              durasi={durasi}
            />
          )}

          <PilihPromo
            idSpace={space.id}
            value={promo}
            onChange={setPromo}
            nonaktif={mutasi.isPending}
          />

          <div className="bg-card shadow-xs grid gap-3 rounded-xl border p-4">
            <RingkasanHarga rincian={rincian} namaPromo={promo?.nama_diskon} />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!tersedia || ketersediaan.isFetching || mutasi.isPending}
          >
            <CalendarCheck />
            Lanjutkan
          </Button>
        </form>
      </Form>

      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi pemesanan</AlertDialogTitle>
            <AlertDialogDescription>
              Periksa kembali sebelum pemesanan dikirim.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Space</dt>
              <dd className="text-right font-medium">{space.nama_space}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Jadwal</dt>
              <dd className="text-right">
                {tanggalDanJam(
                  tanggal,
                  jamMulai,
                  hitungJamSelesai(jamMulai || '00:00', durasi || 1),
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
              <dt>Total bayar</dt>
              <dd>
                <Rupiah nilai={rincian.total_bayar} />
              </dd>
            </div>
          </dl>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutasi.isPending}>
              Periksa lagi
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutasi.isPending}
              onClick={(e) => {
                e.preventDefault();
                mutasi.mutate(form.getValues());
              }}
            >
              {mutasi.isPending ? 'Memproses…' : 'Ya, pesan sekarang'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Penanda hasil pengecekan jadwal, tepat di bawah pilihan waktunya. */
function StatusKetersediaan({
  memuat,
  tersedia,
  pesanBentrok,
  jamMulai,
  durasi,
}: {
  memuat: boolean;
  tersedia: boolean;
  pesanBentrok: string | null;
  jamMulai: string;
  durasi: number;
}) {
  if (memuat) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Memeriksa ketersediaan…
      </p>
    );
  }

  if (tersedia) {
    return (
      <p className="text-status-berhasil bg-status-berhasil-bg flex items-center gap-2 rounded-md px-3 py-2 text-sm">
        <CircleCheck className="size-4 shrink-0" />
        Tersedia pada {jamMulai}&ndash;
        {hitungJamSelesai(jamMulai || '00:00', durasi || 1)}
      </p>
    );
  }

  if (pesanBentrok) {
    return (
      <p className="text-status-gagal bg-status-gagal-bg flex items-center gap-2 rounded-md px-3 py-2 text-sm">
        <CircleAlert className="size-4 shrink-0" />
        {pesanBentrok}
      </p>
    );
  }

  return null;
}

/**
 * Tampilan setelah pemesanan berhasil.
 *
 * Seluruh angkanya diambil dari response backend, bukan dari perhitungan
 * pratinjau, sehingga yang dilihat pengguna adalah yang benar-benar tersimpan.
 */
function PemesananBerhasil({
  hasil,
  namaSpace,
}: {
  hasil: ReservasiBaru;
  namaSpace: string;
}) {
  return (
    <div className="grid gap-5">
      <div className="border-status-berhasil bg-status-berhasil-bg grid gap-2 rounded-lg border p-5 text-center">
        <CircleCheck className="text-status-berhasil mx-auto size-8" />
        <h2 className="text-lg font-semibold">Reservasi berhasil dibuat</h2>
        <p className="text-muted-foreground text-sm">
          Silakan tunggu konfirmasi dari pengelola.
        </p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-wide">
          {hasil.kode_booking}
        </p>
      </div>

      <dl className="grid gap-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Space</dt>
          <dd className="text-right font-medium">{namaSpace}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Jadwal</dt>
          <dd className="text-right">
            {tanggalDanJam(
              hasil.tanggal_reservasi,
              hasil.jam_mulai,
              hasil.jam_selesai,
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>
            <Rupiah nilai={hasil.total_harga_awal} />
          </dd>
        </div>
        {hasil.potongan_diskon > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Potongan</dt>
            <dd className="text-status-berhasil tabular-nums">
              &minus;<Rupiah nilai={hasil.potongan_diskon} />
            </dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
          <dt>Total bayar</dt>
          <dd>
            <Rupiah nilai={hasil.total_bayar} />
          </dd>
        </div>
      </dl>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button render={<Link href={`/reservasi/${hasil.id}`}>
          <Receipt />
          Lihat detail reservasi
        </Link>} />
        <Button variant="outline" render={<Link href="/spaces">Pesan space lain</Link>} />
      </div>
    </div>
  );
}
