import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
