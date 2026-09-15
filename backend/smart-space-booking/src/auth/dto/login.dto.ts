import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username pengguna terdaftar',
  })
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username wajib diisi' })
  username!: string;

  @ApiProperty({
    example: 'Secret123!',
    description: 'Kata sandi akun pengguna',
  })
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password!: string;
}
