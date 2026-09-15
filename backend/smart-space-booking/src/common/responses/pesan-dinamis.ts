/**
 * Pembungkus untuk response yang pesannya bergantung pada hasilnya.
 *
 * `@ResponseMessage` bersifat tetap per endpoint, sedangkan beberapa endpoint
 * pada soal memuat nilai di dalam pesannya, misalnya
 * "Status reservasi berhasil diperbarui menjadi disetujui". Service mengembalikan
 * pembungkus ini, lalu TransformResponseInterceptor memakai pesannya dan
 * meneruskan `data`-nya seperti biasa, sehingga bentuk amplopnya tetap sama.
 */
export class ResponseDenganPesan<T> {
  constructor(
    readonly pesan: string,
    readonly data: T,
  ) {}
}

export const denganPesan = <T>(pesan: string, data: T) =>
  new ResponseDenganPesan(pesan, data);
