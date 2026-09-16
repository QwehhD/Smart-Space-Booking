import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusReservasi } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PESAN_VALIDASI } from '../../../common/constants/validation.constant';
import { IsTanggalWujud } from '../../../common/validators/tanggal-wujud.validator';

export class ListReservasiQueryDto {
  @ApiPropertyOptional({ example: 8, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt({ message: 'Bulan harus berupa bilangan bulat' })
  @Min(1, { message: 'Bulan harus antara 1 sampai 12' })
  @Max(12, { message: 'Bulan harus antara 1 sampai 12' })
  month?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt({ message: 'Tahun harus berupa bilangan bulat' })
  @Min(2000, { message: 'Tahun tidak valid' })
  @Max(2100, { message: 'Tahun tidak valid' })
  year?: number;

  @ApiPropertyOptional({ enum: StatusReservasi })
  @IsOptional()
  @IsEnum(StatusReservasi, {
    message:
      'Status harus salah satu dari: belum_dikonfirm, disetujui, aktif, selesai, dibatalkan',
  })
  status?: StatusReservasi;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt({ message: 'ID space harus berupa bilangan bulat' })
  @Min(1, { message: 'ID space tidak valid' })
  id_space?: number;

  @ApiPropertyOptional({ example: '2026-08-30' })
  @IsOptional()
  @IsString({ message: 'Tanggal harus berupa teks' })
  @IsTanggalWujud({ message: PESAN_VALIDASI.TANGGAL_WUJUD })
  tanggal?: string;
}
