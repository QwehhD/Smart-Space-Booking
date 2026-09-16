import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  PASSWORD_MAKS,
  PESAN_VALIDASI,
} from '../../common/constants/validation.constant';

export class LoginMakerDto {
  @ApiProperty({
    example: 'budisantoso',
    description: 'Username atau alamat email akun App Maker',
  })
  @IsString({ message: 'Username atau email harus berupa teks' })
  @IsNotEmpty({ message: 'Username atau email wajib diisi' })
  @MaxLength(100, {
    message: 'Username atau email maksimal 100 karakter',
  })
  usernameOrEmail!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MaxLength(PASSWORD_MAKS, { message: PESAN_VALIDASI.PASSWORD_PANJANG })
  password!: string;
}
