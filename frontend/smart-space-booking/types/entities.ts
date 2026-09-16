/**
 * Bentuk data yang dikembalikan backend.
 *
 * Seluruh tipe di sini diturunkan dari serializer di
 * `backend/src/common/serializers/`, bukan dari contoh pada PDF soal, karena
 * contoh di PDF berbeda-beda antar endpoint sedangkan serializer adalah yang
 * benar-benar dikirim.
 *
 * Nilai tanggal dan waktu tiba sebagai string JSON. Yang berbentuk `YYYY-MM-DD`
 * ditandai `TanggalISO`, sedangkan yang berupa waktu penuh ditandai `WaktuISO`,
 * supaya keduanya tidak tertukar saat diformat.
 */

/** Tanggal saja, `YYYY-MM-DD`. Jangan di-parse dengan `new Date()` langsung. */
export type TanggalISO = string;

/** Waktu penuh ISO 8601, misalnya `2026-08-27T02:59:53.089Z`. */
export type WaktuISO = string;

/** Jam 24 jam dua digit, `HH:mm`. */
export type Jam = string;

export type Role = 'member' | 'admin_space';

export type TipeSpace = 'desk' | 'meeting_room' | 'private_office';

export type StatusReservasi =
  | 'belum_dikonfirm'
  | 'disetujui'
  | 'aktif'
  | 'selesai'
  | 'dibatalkan';

/* ---------- profil ---------- */

export interface Member {
  id: number;
  nama_member: string;
  instansi: string;
  alamat: string;
  telp: string;
  foto: string | null;
  foto_url: string | null;
  created_at: WaktuISO;
}

export interface SpaceOwner {
  id: number;
  nama_coworking: string;
  nama_pemilik: string;
  telp: string;
  alamat: string | null;
  deskripsi: string | null;
  foto: string | null;
  foto_url: string | null;
}

/* ---------- autentikasi ---------- */

/** Hasil `POST /auth/login`. Kedua kunci profil selalu ada, satu di antaranya null. */
export interface HasilLogin {
  id: number;
  username: string;
  role: Role;
  maker_id: number;
  member: Member | null;
  space_owner: SpaceOwner | null;
  access_token: string;
}

/** Hasil registrasi. Hanya memuat kunci profil yang sesuai rolenya. */
export interface HasilRegistrasi {
  id: number;
  username: string;
  role: Role;
  member?: Member;
  space_owner?: SpaceOwner;
  access_token: string;
}

/** Hasil `GET /auth/profile`. Tanpa `maker_id`, dan hanya kunci yang relevan. */
export interface ProfilPengguna {
  id: number;
  username: string;
  role: Role;
  member?: Member;
  space_owner?: SpaceOwner;
}

/* ---------- space ---------- */

export interface Space {
  id: number;
  nama_space: string;
  harga_per_jam: number;
  tipe: TipeSpace;
  kapasitas: number;
  deskripsi: string;
  foto: string | null;
  foto_url: string | null;
  id_owner: number;
}

/** Space pada katalog publik, disertai data pengelolanya. */
export interface SpacePublik extends Space {
  owner: {
    id: number;
    nama_coworking: string;
    nama_pemilik: string;
    telp: string;
  };
}

export interface KeteranganTipeSpace {
  tipe: TipeSpace;
  label: string;
  deskripsi: string;
}

/** Hasil `GET /spaces/availability`. Ketidaktersediaan dibalas error 400. */
export interface Ketersediaan {
  available: true;
  id_space: number;
  nama_space: string;
  tanggal: TanggalISO;
  jam_mulai: Jam;
  jam_selesai: Jam;
  durasi_jam: number;
  harga_per_jam: number;
  estimasi_total: number;
}

/* ---------- diskon ---------- */

export interface Diskon {
  id: number;
  nama_diskon: string;
  persentase_diskon: number;
  tanggal_awal: WaktuISO;
  tanggal_akhir: WaktuISO;
  id_owner: number;
}

/** Hasil `POST /diskon/check`, menambahkan penanda aktif. */
export interface DiskonTervalidasi extends Diskon {
  is_active: true;
}

/* ---------- reservasi ---------- */

/** Bentuk ringkas pada `GET /reservasi/my`. */
export interface ReservasiRingkas {
  id: number;
  kode_booking: string;
  tanggal_reservasi: TanggalISO;
  jam_mulai: Jam;
  jam_selesai: Jam;
  durasi_jam: number;
  total_bayar: number;
  status: StatusReservasi;
  space: { id: number; nama_space: string; tipe: TipeSpace } | null;
}

/** Bentuk yang dikembalikan tepat setelah `POST /reservasi`. */
export interface ReservasiBaru {
  id: number;
  kode_booking: string;
  id_member: number;
  id_space: number | null;
  id_diskon: number | null;
  tanggal_reservasi: TanggalISO;
  jam_mulai: Jam;
  jam_selesai: Jam;
  durasi_jam: number;
  harga_per_jam: number;
  total_harga_awal: number;
  potongan_diskon: number;
  total_bayar: number;
  status: StatusReservasi;
  created_at: WaktuISO;
}

/** Bentuk `GET /reservasi/{id}`, dapat dibuka member pemilik maupun adminnya. */
export interface ReservasiDetail {
  id: number;
  kode_booking: string;
  id_member: number;
  id_space: number | null;
  tanggal_reservasi: TanggalISO;
  jam_mulai: Jam;
  jam_selesai: Jam;
  durasi_jam: number;
  total_bayar: number;
  status: StatusReservasi;
  member: { nama_member: string; telp: string };
  space: { nama_space: string; harga_per_jam: number } | null;
}

/** Bentuk pada panel admin, memuat rincian uang dan waktu kehadiran. */
export interface ReservasiAdmin {
  id: number;
  kode_booking: string;
  tanggal_reservasi: TanggalISO;
  jam_mulai: Jam;
  jam_selesai: Jam;
  durasi_jam: number;
  total_harga_awal: number;
  potongan_diskon: number;
  total_bayar: number;
  status: StatusReservasi;
  check_in_time: WaktuISO | null;
  check_out_time: WaktuISO | null;
  member: { id: number; nama_member: string; telp: string };
  space: { id: number; nama_space: string; tipe: TipeSpace } | null;
}

/** Item histori memakai `space_name` yang datar, bukan objek `space`. */
export interface ItemHistori
  extends Omit<ReservasiRingkas, 'space'> {
  space_name: string | null;
}

export interface HistoriBulanan {
  month: number;
  year: number;
  total_reservasi: number;
  total_pengeluaran: number;
  items: ItemHistori[];
}

/* ---------- e-ticket ---------- */

export interface ETicket {
  e_ticket_number: string;
  kode_booking: string;
  coworking_space: { nama: string; telepon: string };
  member: { nama: string; instansi: string; telp: string };
  space: { nama: string | null; tipe: string | null; harga_per_jam: number };
  jadwal: {
    tanggal: TanggalISO;
    jam_mulai: Jam;
    jam_selesai: Jam;
    durasi: string;
  };
  rincian_pembayaran: {
    tarif_kotor: number;
    /** Sudah berbentuk kalimat siap tampil, misalnya `20% (DISKONHEMAT20)`. */
    diskon_promo: string | null;
    potongan: number;
    total_dibayar: number;
  };
  status_reservasi: StatusReservasi;
  qr_code_payload: string;
  /** PNG dalam bentuk data URI, langsung dapat dipasang pada `src` gambar. */
  qr_code_data_url: string;
}

/* ---------- laporan ---------- */

export interface RincianTipeSpace {
  tipe: TipeSpace;
  label: string;
  total_booking: number;
  total_jam: number;
  total_pendapatan: number;
}

export interface PendapatanHarian {
  tanggal: TanggalISO;
  total: number;
}

export interface LaporanBulanan {
  month: number;
  year: number;
  total_transaksi: number;
  total_jam_terpakai: number;
  estimasi_pendapatan_kotor: number;
  total_potongan_diskon: number;
  realisasi_pendapatan_bersih: number;
  rincian_per_tipe_space: RincianTipeSpace[];
  /** Setiap hari dalam bulan tersebut; jumlahnya sama dengan pendapatan bersih. */
  pendapatan_per_hari: PendapatanHarian[];
}

/* ---------- upload ---------- */

/** `POST /upload/image` mengembalikan rincian lengkap. */
export interface HasilUploadLengkap {
  filename: string;
  original_name: string;
  mimetype: string;
  size: number;
  url: string;
}

/** `POST /upload/spaces` dan `/upload/members` mengembalikan bentuk ringkas. */
export interface HasilUpload {
  filename: string;
  url: string;
}
