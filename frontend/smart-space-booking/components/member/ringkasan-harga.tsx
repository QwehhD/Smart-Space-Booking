import { Rupiah } from '@/components/shared/rupiah';
import type { RincianHarga } from '@/lib/pricing';

/**
 * Rincian harga pada form pemesanan.
 *
 * Angkanya adalah pratinjau yang dihitung di klien dengan rumus yang sama persis
 * dengan backend, termasuk pembulatan potongan ke bawah. Angka yang ditampilkan
 * setelah pemesanan berhasil diambil dari response backend, bukan dari sini.
 */
export function RingkasanHarga({
  rincian,
  namaPromo,
}: {
  rincian: RincianHarga;
  namaPromo?: string | null;
}) {
  return (
    <dl className="grid gap-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>
          <Rupiah nilai={rincian.tarif_kotor} />
        </dd>
      </div>

      {rincian.potongan > 0 ? (
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">
            Diskon {rincian.persentase_diskon}%
            {namaPromo ? (
              <span className="text-muted-foreground"> ({namaPromo})</span>
            ) : null}
          </dt>
          <dd className="text-status-berhasil tabular-nums">
            &minus;<Rupiah nilai={rincian.potongan} />
          </dd>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t pt-2 text-base font-semibold">
        <dt>Total bayar</dt>
        <dd>
          <Rupiah nilai={rincian.total_bayar} />
        </dd>
      </div>
    </dl>
  );
}
