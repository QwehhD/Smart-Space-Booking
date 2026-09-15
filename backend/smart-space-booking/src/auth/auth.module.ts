import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppJwtModule } from '../common/jwt/app-jwt.module';
import { MakerModule } from '../maker/maker.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [AppJwtModule, MakerModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, AppJwtModule],
})
export class AuthModule {}
