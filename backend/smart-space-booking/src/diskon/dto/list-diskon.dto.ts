import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListDiskonQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description:
      'Bila diisi, hanya promo milik pengelola space tersebut yang dikembalikan',
  })
  @IsOptional()
  @IsInt({ message: 'ID space harus berupa bilangan bulat' })
  @Min(1, { message: 'ID space tidak valid' })
  id_space?: number;
}
