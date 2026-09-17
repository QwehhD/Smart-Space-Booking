'use client';

import { Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
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

/**
 * Tombol hapus dengan konfirmasi, dipakai ketiga halaman master data.
 *
 * Seluruh penghapusan di backend bersifat soft delete, sehingga barisnya hilang
 * dari daftar tetapi riwayat yang merujuknya tetap utuh. Kalimat konfirmasinya
 * karena itu tidak menjanjikan penghapusan permanen.
 */
export function TombolHapus({
  judul,
  keterangan,
  sedangProses,
  onHapus,
  labelTombol = 'Hapus',
  ikonSaja,
}: {
  judul: string;
  keterangan: ReactNode;
  sedangProses: boolean;
  onHapus: () => void;
  labelTombol?: string;
  ikonSaja?: boolean;
}) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size={ikonSaja ? 'icon' : 'sm'}
        onClick={() => setTerbuka(true)}
        aria-label={ikonSaja ? labelTombol : undefined}
        className="text-status-gagal hover:text-status-gagal hover:bg-status-gagal-bg"
      >
        <Trash2 />
        {ikonSaja ? null : labelTombol}
      </Button>

      <AlertDialog open={terbuka} onOpenChange={setTerbuka}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{judul}</AlertDialogTitle>
            <AlertDialogDescription>{keterangan}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sedangProses}>
              Tidak jadi
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={sedangProses}
              onClick={(e) => {
                e.preventDefault();
                onHapus();
              }}
            >
              {sedangProses ? 'Menghapus…' : 'Ya, hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
