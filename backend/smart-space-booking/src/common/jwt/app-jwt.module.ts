import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

/**
 * Konfigurasi JWT dipisahkan ke modul sendiri karena dipakai dua modul yang
 * menerbitkan token berbeda, yaitu AuthModule untuk member/admin space dan
 * MakerModule untuk akun siswa. Tanpa pemisahan ini keduanya harus saling
 * mengimpor dan menimbulkan ketergantungan melingkar.
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('jwt.secret'),
        // Masa berlaku token dikonfigurasi lewat env sebagai string bebas,
        // sedangkan tipe bawaan library hanya menerima literal seperti '1d'.
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') ?? '1d',
        } as JwtModuleOptions['signOptions'],
      }),
    }),
  ],
  exports: [JwtModule],
})
export class AppJwtModule {}
