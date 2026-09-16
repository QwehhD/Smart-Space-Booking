import type { Metadata, Viewport } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Smart Space Booking',
    template: '%s · Smart Space Booking',
  },
  description:
    'Reservasi coworking space: cari ruangan atau meja kerja, pesan per jam, dan cetak e-ticket.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
