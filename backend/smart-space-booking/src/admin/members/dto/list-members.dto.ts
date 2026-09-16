import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

/**
 * Parameter pencarian member.
 *
 * Dibuat sebagai DTO, bukan dibaca langsung lewat `@Query('search')`, supaya
 * ValidationPipe ikut memeriksanya. Tanpa itu, nilai berupa array atau objek
 * (misalnya `?search[]=a` atau `?search[$ne]=x`) diterima begitu saja dan
 * penyaringannya diam-diam diabaikan, sedangkan nilai yang sangat panjang
 * baru tertahan oleh batas header server.
 */
export class ListMembersQueryDto {
  @ApiPropertyOptional({
    example: 'Budi',
    description: 'Cari berdasarkan nama, instansi, atau nomor telepon',
  })
  @IsOptional()
  @IsString({ message: 'Kata kunci pencarian harus berupa teks' })
  @Length(1, 100, { message: 'Kata kunci pencarian maksimal 100 karakter' })
  search?: string;
}
