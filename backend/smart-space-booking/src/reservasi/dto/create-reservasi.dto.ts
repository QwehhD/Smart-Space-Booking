import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  JAM_REGEX,
  PESAN_VALIDASI,
} from '../../common/constants/validation.constant';
import { IsTanggalWujud } from '../../common/validators/tanggal-wujud.validator';

const DURASI_MAKSIMAL = 24;

export class CreateReservasiDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'ID space harus berupa bilangan bulat' })
  @Min(1, { message: 'ID space tidak valid' })
  id_space!: number;

  @ApiProperty({ example: '2026-08-30' })
  @IsString({ message: 'Tanggal reservasi harus berupa teks' })
  @IsTanggalWujud({ message: PESAN_VALIDASI.TANGGAL_WUJUD })
  tanggal_reservasi!: string;

  @ApiProperty({ example: '09:00' })
  @IsString({ message: 'Jam mulai harus berupa teks' })
  @Matches(JAM_REGEX, { message: PESAN_VALIDASI.JAM_FORMAT })
  jam_mulai!: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt({ message: 'Durasi harus berupa bilangan bulat jam' })
  @Min(1, { message: 'Durasi minimal 1 jam' })
  @Max(DURASI_MAKSIMAL, { message: 'Durasi maksimal 24 jam' })
  durasi_jam!: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID promo yang dipilih dari katalog diskon',
  })
  @IsOptional()
  @IsInt({ message: 'ID diskon harus berupa bilangan bulat' })
  @Min(1, { message: 'ID diskon tidak valid' })
  id_diskon?: number;

  @ApiPropertyOptional({
    example: 'DISKONHEMAT20',
    description:
      'Kode promo yang diketik manual; didahulukan bila keduanya dikirim',
  })
  @IsOptional()
  @IsString({ message: 'Kode promo harus berupa teks' })
  @MaxLength(100, { message: 'Kode promo maksimal 100 karakter' })
  kode_promo?: string;
}
