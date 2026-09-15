import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Rentang tahun sekadar penjaga salah ketik, bukan aturan bisnis dari soal. */
const TAHUN_MINIMAL = 2000;
const TAHUN_MAKSIMAL = 2100;

export class HistoryQueryDto {
  @ApiPropertyOptional({ example: 8, minimum: 1, maximum: 12 })
  @IsOptional()
  @IsInt({ message: 'Bulan harus berupa bilangan bulat' })
  @Min(1, { message: 'Bulan harus antara 1 sampai 12' })
  @Max(12, { message: 'Bulan harus antara 1 sampai 12' })
  month?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt({ message: 'Tahun harus berupa bilangan bulat' })
  @Min(TAHUN_MINIMAL, { message: 'Tahun tidak valid' })
  @Max(TAHUN_MAKSIMAL, { message: 'Tahun tidak valid' })
  year?: number;
}
