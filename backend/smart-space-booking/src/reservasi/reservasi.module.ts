import { Module } from '@nestjs/common';
import { DiskonModule } from '../diskon/diskon.module';
import { SpacesModule } from '../spaces/spaces.module';
import { EtiketService } from './eticket.service';
import { ReservasiController } from './reservasi.controller';
import { ReservasiService } from './reservasi.service';

@Module({
  imports: [SpacesModule, DiskonModule],
  controllers: [ReservasiController],
  providers: [ReservasiService, EtiketService],
  exports: [ReservasiService],
})
export class ReservasiModule {}
