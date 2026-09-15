import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Max, Min } from 'class-validator';
import {
  JAM_REGEX,
  PESAN_VALIDASI,
  TANGGAL_REGEX,
} from '../../../common/constants/validation.constant';

/** Batas atas durasi; satu reservasi tidak boleh melewati tengah malam. */
const DURASI_MAKSIMAL = 24;

export class CheckAvailabilityQueryDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'ID space harus berupa bilangan bulat' })
  @Min(1, { message: 'ID space tidak valid' })
  id_space!: number;

  @ApiProperty({ example: '2026-08-30' })
  @IsString({ message: 'Tanggal harus berupa teks' })
  @Matches(TANGGAL_REGEX, { message: PESAN_VALIDASI.TANGGAL_FORMAT })
  tanggal!: string;

  @ApiProperty({ example: '09:00' })
  @IsString({ message: 'Jam mulai harus berupa teks' })
  @Matches(JAM_REGEX, { message: PESAN_VALIDASI.JAM_FORMAT })
  jam_mulai!: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt({ message: 'Durasi harus berupa bilangan bulat jam' })
  @Min(1, { message: 'Durasi minimal 1 jam' })
  @Max(DURASI_MAKSIMAL, { message: 'Durasi maksimal 24 jam' })
  durasi_jam!: number;
}
