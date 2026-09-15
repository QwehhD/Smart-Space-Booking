import { Module } from '@nestjs/common';
import { AppJwtModule } from '../common/jwt/app-jwt.module';
import { MakerModule } from '../maker/maker.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [AppJwtModule, MakerModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, AppJwtModule],
})
export class AuthModule {}
