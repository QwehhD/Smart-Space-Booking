import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  NAMA_BERKAS_REGEX,
  PESAN_VALIDASI,
  TELP_REGEX,
  USERNAME_REGEX,
} from '../../common/constants/validation.constant';

export class RegisterAdminSpaceDto {
  @ApiProperty({ example: 'admin_space1' })
  @IsString({ message: 'Username harus berupa teks' })
  @Length(3, 50, {
    message: 'Username harus terdiri dari 3 sampai 50 karakter',
  })
  @Matches(USERNAME_REGEX, { message: PESAN_VALIDASI.USERNAME_FORMAT })
  username: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(72, { message: 'Password maksimal 72 karakter' })
  password: string;

  @ApiProperty({ example: 'Moklet Hub Coworking' })
  @IsString({ message: 'Nama coworking harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama coworking harus terdiri dari 3 sampai 100 karakter',
  })
  nama_coworking: string;

  @ApiProperty({ example: 'Ahmad Bidin' })
  @IsString({ message: 'Nama pemilik harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama pemilik harus terdiri dari 3 sampai 100 karakter',
  })
  nama_pemilik: string;

  @ApiProperty({ example: '081298765432' })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Length(8, 20, {
    message: 'Nomor telepon harus terdiri dari 8 sampai 20 karakter',
  })
  @Matches(TELP_REGEX, { message: PESAN_VALIDASI.TELP_FORMAT })
  telp: string;

  @ApiPropertyOptional({ example: 'Jl. Danau Ranau No. 1, Malang' })
  @IsOptional()
  @IsString({ message: 'Alamat harus berupa teks' })
  @MaxLength(255, { message: 'Alamat maksimal 255 karakter' })
  alamat?: string;

  @ApiPropertyOptional({
    example:
      'Coworking space 3 lantai dengan WiFi 100 Mbps dan area parkir luas.',
  })
  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  @MaxLength(1000, { message: 'Deskripsi maksimal 1000 karakter' })
  deskripsi?: string;

  @ApiPropertyOptional({ example: 'moklet_hub.jpg' })
  @IsOptional()
  @IsString({ message: 'Foto harus berupa nama file' })
  @MaxLength(255, { message: 'Nama file foto maksimal 255 karakter' })
  @Matches(NAMA_BERKAS_REGEX, { message: PESAN_VALIDASI.NAMA_BERKAS_FORMAT })
  foto?: string;
}
