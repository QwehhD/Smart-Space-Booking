/**
 * Tautan lompat ke konten utama.
 *
 * Kedua bingkai aplikasi menaruh navigasi sebelum isi halaman, sehingga pengguna
 * keyboard dan pembaca layar harus melewati seluruh menu sebelum sampai ke
 * isinya. Tautan ini hanya muncul ketika mendapat fokus, jadi tidak mengubah
 * tampilan bagi pengguna tetikus.
 *
 * Tujuannya `#konten-utama`, yang dipasang pada elemen `main` di setiap layout.
 */
export function LewatiKeKonten() {
  return (
    <a
      href="#konten-utama"
      className="bg-primary text-primary-foreground focus-visible:ring-ring sr-only rounded-md px-4 py-2 text-sm font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:ring-2 focus-visible:outline-none"
    >
      Lewati ke konten utama
    </a>
  );
}
