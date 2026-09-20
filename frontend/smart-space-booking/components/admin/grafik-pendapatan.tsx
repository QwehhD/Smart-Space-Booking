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
        <BarChart data={titik} margin={{ top: 8, right: 8, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="pendapatanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="hari"
            interval={3}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          />
          <YAxis
            width={56}
            tickLine={false}
            axisLine={false}
            tickFormatter={rupiahRingkas}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-accent)', opacity: 0.4 }}
            labelFormatter={(_, muatan) => {
              const baris = muatan?.[0]?.payload as PendapatanHarian | undefined;
              return baris ? tanggalPanjang(baris.tanggal) : '';
            }}
            formatter={(nilai) => [
              rupiah(typeof nilai === 'number' ? nilai : 0),
              'Pendapatan Bersih',
            ]}
            contentStyle={{
              borderRadius: '0.875rem',
              border: '1px solid var(--color-border)',
              background: 'var(--color-card)',
              boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.15)',
              color: 'var(--color-card-foreground)',
              fontSize: '0.8125rem',
              fontWeight: '500',
              padding: '8px 12px',
            }}
          />
          <Bar
            dataKey="total"
            fill="url(#pendapatanGradient)"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
