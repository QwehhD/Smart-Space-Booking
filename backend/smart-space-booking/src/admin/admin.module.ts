import { Module } from '@nestjs/common';
import { AdminProfileController } from './profile/profile.controller';
import { AdminProfileService } from './profile/profile.service';
import { AdminSpacesController } from './spaces/spaces.controller';
import { AdminSpacesService } from './spaces/spaces.service';

/**
 * Panel pengelola lokasi coworking space. Setiap sumber daya admin ditambahkan
 * sebagai controller dan service tersendiri di bawah modul ini.
 */
@Module({
  controllers: [AdminProfileController, AdminSpacesController],
  providers: [AdminProfileService, AdminSpacesService],
})
export class AdminModule {}
