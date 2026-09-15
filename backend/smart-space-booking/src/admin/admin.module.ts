import { Module } from '@nestjs/common';
import { AdminProfileController } from './profile/profile.controller';
import { AdminProfileService } from './profile/profile.service';

/**
 * Panel pengelola lokasi coworking space. Setiap sumber daya admin ditambahkan
 * sebagai controller dan service tersendiri di bawah modul ini.
 */
@Module({
  controllers: [AdminProfileController],
  providers: [AdminProfileService],
})
export class AdminModule {}
