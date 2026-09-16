import { Module } from '@nestjs/common';
import { SpacesModule } from '../spaces/spaces.module';
import { DiskonController } from './diskon.controller';
import { DiskonService } from './diskon.service';

@Module({
  // Dibutuhkan untuk menerjemahkan id_space menjadi pengelolanya saat menyaring
  // dan memvalidasi kepemilikan promo.
  imports: [SpacesModule],
  controllers: [DiskonController],
  providers: [DiskonService],
  exports: [DiskonService],
})
export class DiskonModule {}
