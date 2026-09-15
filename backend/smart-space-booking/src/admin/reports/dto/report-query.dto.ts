import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ReportQueryDto {
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
}
