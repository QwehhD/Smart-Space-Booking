import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import {
  NAMA_BERKAS_REGEX,
  PESAN_VALIDASI,
  TELP_REGEX,
} from '../../../common/constants/validation.constant';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Moklet Hub Coworking Space' })
  @IsString({ message: 'Nama coworking harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama coworking harus terdiri dari 3 sampai 100 karakter',
  })
  nama_coworking!: string;

  @ApiProperty({ example: 'Ahmad Bidin, S.Kom' })
  @IsString({ message: 'Nama pemilik harus berupa teks' })
  @Length(3, 100, {
    message: 'Nama pemilik harus terdiri dari 3 sampai 100 karakter',
  })
  nama_pemilik!: string;

  @ApiProperty({ example: '081298765432' })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @Length(8, 20, {
    message: 'Nomor telepon harus terdiri dari 8 sampai 20 karakter',
  })
  @Matches(TELP_REGEX, { message: PESAN_VALIDASI.TELP_FORMAT })
  telp!: string;

  // Ketiga field berikut tidak disebut soal pada payload update, tetapi tersimpan
  // sejak registrasi. Dibuat opsional supaya request tiga field seperti contoh
  // soal tetap diterima apa adanya, sementara data yang sudah ada tidak menjadi
  // mustahil diperbarui.
  @ApiPropertyOptional({ example: 'Jl. Danau Ranau No. 1, Malang' })
  @IsOptional()
  @IsString({ message: 'Alamat harus berupa teks' })
  @Length(3, 255, {
    message: 'Alamat harus terdiri dari 3 sampai 255 karakter',
  })
  alamat?: string;

  @ApiPropertyOptional({ example: 'Coworking space nyaman di pusat kota.' })
  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  @Length(3, 1000, {
    message: 'Deskripsi harus terdiri dari 3 sampai 1000 karakter',
  })
  deskripsi?: string;

  @ApiPropertyOptional({ example: '1787799592972-544446318.jpeg' })
  @IsOptional()
  @IsString({ message: 'Nama berkas foto harus berupa teks' })
  @Length(1, 255, { message: 'Nama berkas foto maksimal 255 karakter' })
  @Matches(NAMA_BERKAS_REGEX, { message: PESAN_VALIDASI.NAMA_BERKAS_FORMAT })
  foto?: string;
}
