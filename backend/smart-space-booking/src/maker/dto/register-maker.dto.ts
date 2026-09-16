import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  PASSWORD_MAKS,
  PESAN_VALIDASI,
  USERNAME_REGEX,
} from '../../common/constants/validation.constant';

export class RegisterMakerDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString({ message: 'Nama harus berupa teks' })
  @Length(3, 100, { message: 'Nama harus terdiri dari 3 sampai 100 karakter' })
  name!: string;

  @ApiProperty({ example: 'budisantoso' })
  @IsString({ message: 'Username harus berupa teks' })
  @Length(3, 50, {
    message: 'Username harus terdiri dari 3 sampai 50 karakter',
  })
  @Matches(USERNAME_REGEX, { message: PESAN_VALIDASI.USERNAME_FORMAT })
  username!: string;

  @ApiProperty({ example: 'budi@smk.sch.id' })
  @IsString({ message: 'Email harus berupa teks' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @Length(5, 100, { message: 'Email harus terdiri dari 5 sampai 100 karakter' })
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 6 })
  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(PASSWORD_MAKS, { message: PESAN_VALIDASI.PASSWORD_PANJANG })
  password!: string;
}
