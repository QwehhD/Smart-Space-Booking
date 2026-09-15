import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { AdminSpacesService } from './spaces.service';

@ApiTags('Admin - Space')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'x-maker-key', required: false })
@Roles(Role.admin_space)
@Controller('admin/spaces')
export class AdminSpacesController {
  constructor(private readonly spacesService: AdminSpacesService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar seluruh space milik admin' })
  daftar(@CurrentUser() user: AuthenticatedUser) {
    return this.spacesService.daftar(user);
  }

  @Post()
  @ResponseMessage('Space baru berhasil ditambahkan!')
  @ApiOperation({ summary: 'Tambah space baru beserta fasilitas dan foto' })
  buat(@Body() dto: CreateSpaceDto, @CurrentUser() user: AuthenticatedUser) {
    return this.spacesService.buat(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail space berdasarkan ID' })
  detail(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.spacesService.detail(id, user);
  }

  @Put(':id')
  @ResponseMessage('Data space berhasil diperbarui!')
  @ApiOperation({ summary: 'Perbarui data ruangan dan fasilitas space' })
  perbarui(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateSpaceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.spacesService.perbarui(id, dto, user);
  }

  @Delete(':id')
  @ResponseMessage('Space berhasil dihapus!')
  @ApiOperation({ summary: 'Hapus space (soft delete)' })
  hapus(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.spacesService.hapus(id, user);
  }
}
