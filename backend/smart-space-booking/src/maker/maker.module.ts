import { Module } from '@nestjs/common';
import { AppJwtModule } from '../common/jwt/app-jwt.module';
import { MakerAuthGuard } from './guards/maker-auth.guard';
import { MakerScopeGuard } from './guards/maker-scope.guard';
import { MakerController } from './maker.controller';
import { MakerService } from './maker.service';

@Module({
  imports: [AppJwtModule],
  controllers: [MakerController],
  providers: [MakerService, MakerAuthGuard, MakerScopeGuard],
  exports: [MakerService],
})
export class MakerModule {}
