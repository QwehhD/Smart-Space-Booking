import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipeSpace } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class ListSpacesQueryDto {
  @ApiPropertyOptional({ enum: TipeSpace })
  @IsOptional()
  @IsEnum(TipeSpace, {
    message:
      'Tipe space harus salah satu dari: desk, meeting_room, private_office',
  })
  tipe?: TipeSpace;

  @ApiPropertyOptional({
    example: 'Alpha',
    description: 'Cari berdasarkan nama space atau fasilitas pada deskripsi',
  })
  @IsOptional()
  @IsString({ message: 'Kata kunci pencarian harus berupa teks' })
  @Length(1, 100, { message: 'Kata kunci pencarian maksimal 100 karakter' })
  search?: string;
}
