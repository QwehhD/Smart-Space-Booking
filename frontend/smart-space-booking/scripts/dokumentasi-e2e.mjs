import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Menyusun tangkapan layar hasil Cypress menjadi satu halaman dokumentasi.
 *
 * Cypress menaruh gambarnya di `cypress/screenshots/<nama spec>/<nama>.png`.
 * Skrip ini membaca struktur itu apa adanya lalu menuliskan satu berkas HTML
 * yang mengelompokkan gambar per spec dan mengurutkannya sesuai nomor langkah,
 * sehingga alurnya terbaca dari atas ke bawah.
 *
 * Halaman hasilnya dapat langsung dibuka di peramban, dan dicetak ke PDF lewat
 * dialog cetak bila ingin dilampirkan ke dokumen UKK.
 */

const AKAR = 'cypress/screenshots';
const KELUARAN = 'cypress/screenshots/index.html';

if (!existsSync(AKAR)) {
  console.error(
    `Folder ${AKAR} belum ada. Jalankan "npm run e2e" lebih dulu supaya gambarnya terbentuk.`,
  );
  process.exit(1);
}

/** Judul yang enak dibaca dari nama spec, misalnya "admin-operasional.cy.ts". */
function judulSpec(nama) {
  return nama
    .replace(/\.cy\.ts$/, '')
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

/** Membuang nomor urut di depan nama berkas, yang hanya untuk pengurutan. */
function judulGambar(nama) {
  return nama.replace(/\.png$/, '').replace(/^\d+\s*/, '');
}

const spec = readdirSync(AKAR)
  .filter((d) => statSync(join(AKAR, d)).isDirectory())
  .sort();

let jumlahGambar = 0;
const bagian = spec.map((d) => {
  const gambar = readdirSync(join(AKAR, d))
    .filter((f) => f.endsWith('.png'))
    .sort();

  jumlahGambar += gambar.length;

  const kartu = gambar
    .map((f) => {
      const src = relative(AKAR, join(AKAR, d, f)).split('\\').join('/');
      const gagal = /\(failed\)/i.test(f);

      return `      <figure${gagal ? ' class="gagal"' : ''}>
        <img src="${encodeURI(src)}" alt="${judulGambar(f)}" loading="lazy" />
        <figcaption>${judulGambar(f)}${gagal ? ' — GAGAL' : ''}</figcaption>
      </figure>`;
    })
    .join('\n');

  return `    <section>
      <h2>${judulSpec(d)} <span class="jumlah">${gambar.length} gambar</span></h2>
      <div class="galeri">
${kartu}
      </div>
    </section>`;
});

const sekarang = new Date().toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  dateStyle: 'long',
  timeStyle: 'short',
});

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Dokumentasi Pengujian — Smart Space Booking</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2.5rem 1.5rem 4rem;
    font: 15px/1.6 "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
    color: #1c2024; background: #fbfbfa;
  }
  .bungkus { max-width: 1100px; margin: 0 auto; }
  header { border-bottom: 1px solid #e4e4e2; padding-bottom: 1.25rem; margin-bottom: 2rem; }
  h1 { font-size: 1.6rem; letter-spacing: -0.02em; margin: 0 0 .35rem; }
  .meta { color: #6b7280; font-size: .85rem; margin: 0; }
  h2 {
    font-size: 1.05rem; letter-spacing: -0.01em; margin: 2.5rem 0 1rem;
    display: flex; align-items: baseline; gap: .6rem;
  }
  .jumlah { font-size: .75rem; font-weight: 500; color: #6b7280; }
  .galeri { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
  figure { margin: 0; background: #fff; border: 1px solid #e4e4e2; border-radius: 12px; overflow: hidden; }
  figure.gagal { border-color: #dc2626; }
  img { display: block; width: 100%; height: auto; border-bottom: 1px solid #eee; }
  figcaption { padding: .7rem .9rem; font-size: .82rem; color: #374151; }
  figure.gagal figcaption { color: #dc2626; font-weight: 600; }
  @media print {
    body { background: #fff; padding: 0; }
    .galeri { grid-template-columns: repeat(2, 1fr); }
    figure { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="bungkus">
  <header>
    <h1>Dokumentasi Pengujian Ujung ke Ujung</h1>
    <p class="meta">Smart Space Booking · ${jumlahGambar} tangkapan layar dari ${spec.length} berkas pengujian · dibuat ${sekarang} WIB</p>
  </header>
${bagian.join('\n')}
</div>
</body>
</html>
`;

writeFileSync(KELUARAN, html);
console.log(`Dokumentasi ditulis: ${KELUARAN}`);
console.log(`  ${spec.length} berkas pengujian, ${jumlahGambar} gambar`);
