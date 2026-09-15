import { ApiProperty } from '@nestjs/swagger';
import { StatusReservasi } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateReservasiStatusDto {
  @ApiProperty({ enum: StatusReservasi, example: StatusReservasi.disetujui })
  @IsEnum(StatusReservasi, {
    message:
      'Status harus salah satu dari: belum_dikonfirm, disetujui, aktif, selesai, dibatalkan',
  })
  status!: StatusReservasi;
}
