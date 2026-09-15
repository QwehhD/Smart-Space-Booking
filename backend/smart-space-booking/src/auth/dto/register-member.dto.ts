import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PESAN_VALIDASI,
  TELP_REGEX,
  USERNAME_REGEX,
} from '../../common/constants/validation.constant';

export class RegisterMemberDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString({ message: 'Username harus berupa teks' })
  @Length(3, 50, {
    message: 'Username harus terdiri dari 3 sampai 50 karakter',
  })
  @Matches(USERNAME_REGEX, { message: PESAN_VALIDASI.USERNAME_FORMAT })
  username: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(72, { message: 'Password maksimal 72 karakter' })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'Nama member harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama member harus terdiri dari 3 sampai 100 karakter',
  })
  nama_member: string;

  @ApiProperty({ example: 'Universitas Indonesia / PT Maju Mundur' })
  @IsString({ message: 'Instansi harus berupa teks' })
  @Length(2, 100, {
    message: 'Instansi harus terdiri dari 2 sampai 100 karakter',
  })
  instansi: string;

  @ApiProperty({ example: 'Jl. Sudirman No. 123, Jakarta Selatan' })
  @IsString({ message: 'Alamat harus berupa teks' })
  @IsNotEmpty({ message: 'Alamat wajib diisi' })
  alamat: string;

  @ApiProperty({ example: '081234567890' })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Length(8, 20, {
    message: 'Nomor telepon harus terdiri dari 8 sampai 20 karakter',
  })
  @Matches(TELP_REGEX, { message: PESAN_VALIDASI.TELP_FORMAT })
  telp: string;

  @ApiPropertyOptional({
    example: 'member_john.jpg',
    description: 'Nama file hasil unggah dari POST /api/upload/members',
  })
  @IsOptional()
  @IsString({ message: 'Foto harus berupa nama file' })
  @MaxLength(255, { message: 'Nama file foto maksimal 255 karakter' })
  foto?: string;
}
