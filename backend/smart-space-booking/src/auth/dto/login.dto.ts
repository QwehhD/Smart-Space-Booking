import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  PASSWORD_MAKS,
  PESAN_VALIDASI,
} from '../../common/constants/validation.constant';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username pengguna terdaftar',
  })
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  username!: string;

  @ApiProperty({
    example: 'Secret123!',
    description: 'Kata sandi akun pengguna',
  })
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MaxLength(PASSWORD_MAKS, { message: PESAN_VALIDASI.PASSWORD_PANJANG })
  password!: string;
}
