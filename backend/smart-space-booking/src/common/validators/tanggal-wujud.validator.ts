import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { TANGGAL_REGEX } from '../constants/validation.constant';

/**
 * Memastikan tanggal `YYYY-MM-DD` benar-benar ada pada kalender.
 *
 * Pemeriksaan pola saja tidak cukup: "2027-02-30" lolos regex, tetapi
 * `Date.UTC(2027, 1, 30)` menggulung menjadi 2 Maret. Tanpa pemeriksaan ini,
 * member yang salah ketik akan menerima reservasi pada hari yang tidak ia minta,
 * dan pengecekan bentroknya pun dilakukan pada hari yang salah.
 */
export function IsTanggalWujud(options?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'isTanggalWujud',
      target: target.constructor,
      propertyName,
      options,
      validator: {
        validate(nilai: unknown) {
          if (typeof nilai !== 'string' || !TANGGAL_REGEX.test(nilai)) {
            return false;
          }

          const [tahun, bulan, hari] = nilai.split('-').map(Number);
          const tanggal = new Date(Date.UTC(tahun, bulan - 1, hari));

          // Bila tanggalnya tidak ada, hasil penyusunan akan menunjuk hari lain.
          return (
            tanggal.getUTCFullYear() === tahun &&
            tanggal.getUTCMonth() === bulan - 1 &&
            tanggal.getUTCDate() === hari
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} harus berupa tanggal yang benar-benar ada, format YYYY-MM-DD`;
        },
      },
    });
  };
}
