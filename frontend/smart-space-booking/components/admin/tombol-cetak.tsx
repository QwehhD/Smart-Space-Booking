'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Membuka dialog cetak peramban.
 *
 * Sama seperti pada e-ticket, tidak ada pustaka PDF yang dipasang: dialog cetak
 * peramban sudah menyediakan "Simpan sebagai PDF", dan tata letak kertasnya
 * diatur `@media print` di `globals.css` lewat kelas `cetak-laporan`.
 */
export function TombolCetak({ label = 'Cetak' }: { label?: string }) {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer />
      {label}
    </Button>
  );
}
