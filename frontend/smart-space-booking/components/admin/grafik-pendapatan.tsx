'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { rupiah, rupiahRingkas, tanggalPanjang } from '@/lib/format';
import type { PendapatanHarian } from '@/types/entities';

/**
 * Grafik pendapatan harian sepanjang satu bulan.
 *
 * Backend selalu mengirim seluruh hari dalam bulan itu, termasuk yang bernilai
 * nol, dan jumlah seluruhnya sama persis dengan `realisasi_pendapatan_bersih`.
 * Karena itu grafiknya menampilkan apa adanya tanpa mengisi atau membuang hari,
 * sehingga bentuknya jujur menggambarkan hari ramai dan hari sepi.
 *
 * Label sumbu X hanya dipasang beberapa hari sekali agar tetap terbaca di layar
 * ponsel; tanggal lengkapnya muncul pada tooltip.
 */
export function GrafikPendapatan({ data }: { data: PendapatanHarian[] }) {
  const adaIsinya = data.some((hari) => hari.total > 0);

  if (!adaIsinya) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed px-6 py-12 text-center text-sm">
        Belum ada pendapatan pada bulan ini.
      </p>
    );
  }

  const titik = data.map((hari) => ({
    ...hari,
    // Nomor hari dipakai sebagai label karena bulan dan tahunnya sudah tertulis
    // pada judul bagian ini.
    hari: Number(hari.tanggal.slice(8, 10)),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={titik} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="hari"
            interval={4}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          />
          <YAxis
            width={52}
            tickLine={false}
            axisLine={false}
            tickFormatter={rupiahRingkas}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-accent)' }}
            labelFormatter={(_, muatan) => {
              const baris = muatan?.[0]?.payload as PendapatanHarian | undefined;
              return baris ? tanggalPanjang(baris.tanggal) : '';
            }}
            // recharts mengetik nilainya longgar karena satu tooltip dapat
            // melayani beberapa seri; di sini hanya ada satu seri bertipe angka.
            formatter={(nilai) => [
              rupiah(typeof nilai === 'number' ? nilai : 0),
              'Pendapatan',
            ]}
            contentStyle={{
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
              background: 'var(--color-popover)',
              color: 'var(--color-popover-foreground)',
              fontSize: '0.8125rem',
            }}
          />
          <Bar dataKey="total" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
