import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { ListReservasiQueryDto } from './dto/list-reservasi.dto';
import { UpdateReservasiStatusDto } from './dto/update-status.dto';
import { AdminReservasiService } from './reservasi.service';

@ApiTags('Admin - Reservasi')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'x-maker-key', required: false })
@Roles(Role.admin_space)
@Controller('admin/reservasi')
export class AdminReservasiController {
  constructor(private readonly reservasiService: AdminReservasiService) {}

  @Get()
  @ApiOperation({ summary: 'Seluruh reservasi pada lokasi ini, dengan filter' })
  daftar(
    @Query() query: ListReservasiQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.daftar(query, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Konfirmasi atau ubah status pemesanan' })
  ubahStatus(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateReservasiStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.ubahStatus(id, dto, user);
  }

  @Post(':id/check-in')
  // Check-in mengubah status reservasi yang sudah ada, bukan membuat data baru,
  // sehingga statusnya 200 seperti dicontohkan soal.
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Check-in member berhasil! Status reservasi aktif.')
  @ApiOperation({ summary: 'Check-in pelanggan' })
  checkIn(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.checkIn(id, user);
  }

  @Post(':id/check-out')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Check-out member berhasil! Reservasi telah selesai.')
  @ApiOperation({ summary: 'Check-out pelanggan' })
  checkOut(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.checkOut(id, user);
  }
}
