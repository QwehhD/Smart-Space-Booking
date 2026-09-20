import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';

/**
 * Plus Jakarta Sans dipilih sebagai huruf utama.
 *
 * Bentuknya tegas dan netral sehingga cocok untuk antarmuka yang banyak memuat
 * angka dan tabel, dan huruf ini memang dirancang di Jakarta sehingga terasa
 * selaras dengan aplikasi berbahasa Indonesia tanpa perlu ornamen apa pun.
 *
 * Sebelumnya tidak ada huruf yang dimuat sama sekali: token `--font-sans`
 * menunjuk pada dirinya sendiri, sehingga seluruh aplikasi jatuh ke huruf bawaan
 * sistem operasi. Itulah sebab utama tampilannya terasa mentah.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-loaded',
  display: 'swap',
});

/**
 * Huruf monospace untuk kode booking dan nomor e-ticket, yang harus mudah
 * dibacakan dan disalin satu karakter demi satu.
 */
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-loaded',
  display: 'swap',
});

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#111112' },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
