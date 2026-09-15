import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CheckPromoDto {
  @ApiProperty({
    example: 'DISKONHEMAT20',
    description: 'Kode promo yang dimasukkan pengguna pada form checkout',
  })
  @IsString({ message: 'Kode promo harus berupa teks' })
  @IsNotEmpty({ message: 'Kode promo wajib diisi' })
  @Length(1, 100, { message: 'Kode promo maksimal 100 karakter' })
  nama_diskon!: string;
}
