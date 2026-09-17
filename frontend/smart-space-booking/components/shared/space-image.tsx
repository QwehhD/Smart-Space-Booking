import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Gambar space beserta penggantinya.
 *
 * `foto_url` bernilai null untuk space yang belum punya foto, sehingga selalu
 * ada bentuk pengganti agar tinggi kartu pada satu baris tetap sama.
 *
 * Memakai tag img biasa, bukan next/image, karena gambarnya disajikan backend
 * pada origin lain dan ukurannya kecil; mengoptimalkannya lewat Next tidak
 * sepadan dengan konfigurasi domain yang harus ditambahkan.
 */
export function SpaceImage({
  url,
  nama,
  className,
  priority,
}: {
  url: string | null;
  nama: string;
  className?: string;
  priority?: boolean;
}) {
  if (!url) {
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex items-center justify-center',
          className,
        )}
        aria-hidden
      >
        <ImageOff className="size-6" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`Foto ${nama}`}
      loading={priority ? 'eager' : 'lazy'}
      className={cn('object-cover', className)}
    />
  );
}
