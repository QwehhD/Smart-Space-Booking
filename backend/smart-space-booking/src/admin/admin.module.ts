import { Module } from '@nestjs/common';
import { AdminProfileController } from './profile/profile.controller';
import { AdminProfileService } from './profile/profile.service';
import { AdminDiskonController } from './diskon/diskon.controller';
import { AdminDiskonService } from './diskon/diskon.service';
import { AdminMembersController } from './members/members.controller';
import { AdminMembersService } from './members/members.service';
import { AdminReservasiController } from './reservasi/reservasi.controller';
import { AdminReservasiService } from './reservasi/reservasi.service';
import { AdminReportsController } from './reports/reports.controller';
import { AdminReportsService } from './reports/reports.service';
import { AdminSpacesController } from './spaces/spaces.controller';
import { AdminSpacesService } from './spaces/spaces.service';

/**
 * Panel pengelola lokasi coworking space. Setiap sumber daya admin ditambahkan
 * sebagai controller dan service tersendiri di bawah modul ini.
 */
@Module({
  controllers: [
    AdminProfileController,
    AdminSpacesController,
    AdminDiskonController,
    AdminMembersController,
    AdminReservasiController,
    AdminReportsController,
  ],
  providers: [
    AdminProfileService,
    AdminSpacesService,
    AdminDiskonService,
    AdminMembersService,
    AdminReservasiService,
    AdminReportsService,
  ],
})
export class AdminModule {}
