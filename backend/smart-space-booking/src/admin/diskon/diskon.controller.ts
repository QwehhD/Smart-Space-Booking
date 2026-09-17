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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { CreateDiskonDto } from './dto/create-diskon.dto';
import { UpdateDiskonDto } from './dto/update-diskon.dto';
import { AdminDiskonService } from './diskon.service';

@ApiTags('Admin - Kode Promo')
@ApiBearerAuth('access-token')
@Roles(Role.admin_space)
@Controller('admin/diskon')
export class AdminDiskonController {
  constructor(private readonly diskonService: AdminDiskonService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar seluruh kode promo milik admin' })
  daftar(@CurrentUser() user: AuthenticatedUser) {
    return this.diskonService.daftar(user);
  }

  @Post()
  @ResponseMessage('Kode promo baru berhasil dibuat!')
  @ApiOperation({ summary: 'Tambah kode promo atau event diskon baru' })
  buat(@Body() dto: CreateDiskonDto, @CurrentUser() user: AuthenticatedUser) {
    return this.diskonService.buat(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail kode promo berdasarkan ID' })
  detail(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.diskonService.detail(id, user);
  }

  @Put(':id')
  @ResponseMessage('Data promo diskon berhasil diperbarui!')
  @ApiOperation({ summary: 'Perbarui kode promo dan periode berlakunya' })
  perbarui(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateDiskonDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.diskonService.perbarui(id, dto, user);
  }

  @Delete(':id')
  @ResponseMessage('Kode promo berhasil dihapus!')
  @ApiOperation({ summary: 'Hapus kode promo (soft delete)' })
  hapus(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.diskonService.hapus(id, user);
  }
}
