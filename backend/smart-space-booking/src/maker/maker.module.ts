import { Module } from '@nestjs/common';
import { MakerService } from './maker.service';

@Module({
  providers: [MakerService],
  exports: [MakerService],
})
export class MakerModule {}
