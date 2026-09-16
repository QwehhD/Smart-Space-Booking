import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import {
  NAMA_BERKAS_REGEX,
  PASSWORD_MAKS,
  PESAN_VALIDASI,
  TELP_REGEX,
  USERNAME_REGEX,
} from '../../../common/constants/validation.constant';

export class CreateMemberAdminDto {
  @ApiProperty({ example: 'user_budi' })
  @IsString({ message: 'Username harus berupa teks' })
  @Length(3, 50, {
    message: 'Username harus terdiri dari 3 sampai 50 karakter',
  })
  @Matches(USERNAME_REGEX, { message: PESAN_VALIDASI.USERNAME_FORMAT })
  username!: string;

  @ApiProperty({ example: 'Secret123!', minLength: 6 })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(PASSWORD_MAKS, { message: PESAN_VALIDASI.PASSWORD_PANJANG })
  password!: string;

  @ApiProperty({ example: 'Budi Raharjo' })
  @IsString({ message: 'Nama member harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama member harus terdiri dari 3 sampai 100 karakter',
  })
  nama_member!: string;

  @ApiProperty({ example: 'SMK Telkom Malang' })
  @IsString({ message: 'Instansi harus berupa teks' })
  @Length(2, 100, {
    message: 'Instansi harus terdiri dari 2 sampai 100 karakter',
  })
  instansi!: string;

  @ApiProperty({ example: 'Jl. Danau Ranau No. 1, Sawojajar, Malang' })
  @IsString({ message: 'Alamat harus berupa teks' })
  @IsNotEmpty({ message: 'Alamat wajib diisi' })
  @Length(5, 255, {
    message: 'Alamat harus terdiri dari 5 sampai 255 karakter',
  })
  alamat!: string;

  @ApiProperty({ example: '085712345678' })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Length(8, 20, {
    message: 'Nomor telepon harus terdiri dari 8 sampai 20 karakter',
  })
  @Matches(TELP_REGEX, { message: PESAN_VALIDASI.TELP_FORMAT })
  telp!: string;

  @ApiPropertyOptional({ example: 'budi_raharjo.jpg' })
  @IsOptional()
  @IsString({ message: 'Nama berkas foto harus berupa teks' })
  @Length(1, 255, { message: 'Nama berkas foto maksimal 255 karakter' })
  @Matches(NAMA_BERKAS_REGEX, { message: PESAN_VALIDASI.NAMA_BERKAS_FORMAT })
  foto?: string;
}
