import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipeSpace } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

/** Batas atas sekadar penjaga salah ketik, bukan aturan bisnis dari soal. */
const HARGA_MAKSIMAL = 100_000_000;
const KAPASITAS_MAKSIMAL = 1000;

export class CreateSpaceDto {
  @ApiProperty({ example: 'Personal Desk Alpha 01' })
  @IsString({ message: 'Nama space harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama space harus terdiri dari 3 sampai 100 karakter',
  })
  nama_space!: string;

  @ApiProperty({
    example: 25000,
    description: 'Tarif sewa per jam dalam Rupiah',
  })
  @IsInt({ message: 'Harga per jam harus berupa bilangan bulat' })
  @Min(0, { message: 'Harga per jam tidak boleh negatif' })
  @Max(HARGA_MAKSIMAL, { message: 'Harga per jam melebihi batas wajar' })
  harga_per_jam!: number;

  @ApiProperty({ enum: TipeSpace, example: TipeSpace.desk })
  @IsEnum(TipeSpace, {
    message:
      'Tipe space harus salah satu dari: desk, meeting_room, private_office',
  })
  tipe!: TipeSpace;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Kapasitas harus berupa bilangan bulat' })
  @Min(1, { message: 'Kapasitas minimal 1 orang' })
  @Max(KAPASITAS_MAKSIMAL, { message: 'Kapasitas melebihi batas wajar' })
  kapasitas!: number;

  @ApiProperty({ example: 'WiFi 100Mbps, stopkontak, monitor 24 inch.' })
  @IsString({ message: 'Deskripsi harus berupa teks' })
  @Length(3, 1000, {
    message: 'Deskripsi harus terdiri dari 3 sampai 1000 karakter',
  })
  deskripsi!: string;

  @ApiPropertyOptional({ example: 'desk_alpha_01.jpg' })
  @IsOptional()
  @IsString({ message: 'Nama berkas foto harus berupa teks' })
  @Length(1, 255, { message: 'Nama berkas foto maksimal 255 karakter' })
  foto?: string;
}
