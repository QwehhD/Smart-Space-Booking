import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginMakerDto {
  @ApiProperty({
    example: 'budisantoso',
    description: 'Username atau alamat email akun App Maker',
  })
  @IsString({ message: 'Username atau email harus berupa teks' })
  @IsNotEmpty({ message: 'Username atau email wajib diisi' })
  usernameOrEmail!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password wajib diisi' })
  password!: string;
}
