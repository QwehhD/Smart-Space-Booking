import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability/availability.controller';
import { AvailabilityService } from './availability/availability.service';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';

@Module({
  // AvailabilityController didaftarkan lebih dulu agar rute tetapnya menang
  // terhadap rute `:id` milik SpacesController.
  controllers: [AvailabilityController, SpacesController],
  providers: [SpacesService, AvailabilityService],
  exports: [SpacesService, AvailabilityService],
})
export class SpacesModule {}
