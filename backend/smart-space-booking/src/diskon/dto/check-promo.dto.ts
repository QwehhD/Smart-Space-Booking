import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CheckPromoDto {
  @ApiProperty({
    example: 'DISKONHEMAT20',
    description: 'Kode promo yang dimasukkan pengguna pada form checkout',
  })
  @IsString({ message: 'Kode promo harus berupa teks' })
  @IsNotEmpty({ message: 'Kode promo wajib diisi' })
  @Length(1, 100, { message: 'Kode promo maksimal 100 karakter' })
  nama_diskon!: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Space yang akan dipesan. Bila diisi, kepemilikan promo ikut diperiksa.',
  })
  @IsOptional()
  @IsInt({ message: 'ID space harus berupa bilangan bulat' })
  @Min(1, { message: 'ID space tidak valid' })
  id_space?: number;
}
