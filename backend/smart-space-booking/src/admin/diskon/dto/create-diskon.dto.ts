import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { KODE_PROMO_REGEX } from '../../../common/constants/validation.constant';

export class CreateDiskonDto {
  @ApiProperty({ example: 'PROMOAGUSTUS' })
  @IsString({ message: 'Nama diskon harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama diskon harus terdiri dari 3 sampai 100 karakter',
  })
  @Matches(KODE_PROMO_REGEX, {
    message:
      'Kode promo hanya boleh berisi huruf kapital dan angka, tanpa spasi',
  })
  nama_diskon!: string;

  @ApiProperty({ example: 20, minimum: 1, maximum: 100 })
  @IsInt({ message: 'Persentase diskon harus berupa bilangan bulat' })
  @Min(1, { message: 'Persentase diskon minimal 1 persen' })
  @Max(100, { message: 'Persentase diskon maksimal 100 persen' })
  persentase_diskon!: number;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsDateString(
    {},
    { message: 'Tanggal awal harus berupa tanggal ISO 8601 yang valid' },
  )
  tanggal_awal!: string;

  @ApiProperty({ example: '2026-08-31T23:59:59Z' })
  @IsDateString(
    {},
    { message: 'Tanggal akhir harus berupa tanggal ISO 8601 yang valid' },
  )
  tanggal_akhir!: string;
}
