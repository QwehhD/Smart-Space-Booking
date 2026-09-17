import { Body, Controller, Get, Put } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { AdminProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Admin - Profil Lokasi')
@ApiBearerAuth('access-token')
@Roles(Role.admin_space)
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly profileService: AdminProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Lihat profil lokasi coworking space' })
  lihat(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.lihat(user.owner_id as number);
  }

  @Put()
  @ResponseMessage('Profil Coworking Space berhasil diperbarui!')
  @ApiOperation({ summary: 'Perbarui profil lokasi coworking space' })
  perbarui(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.perbarui(user.owner_id as number, dto);
  }
}
