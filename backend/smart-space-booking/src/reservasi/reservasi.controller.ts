import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateReservasiDto } from './dto/create-reservasi.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { EtiketService } from './eticket.service';
import { PESAN_RESERVASI } from './reservasi.constant';
import { ReservasiService } from './reservasi.service';

@ApiTags('Reservasi Member')
@ApiBearerAuth('access-token')
@Controller('reservasi')
export class ReservasiController {
  constructor(
    private readonly reservasiService: ReservasiService,
    private readonly etiketService: EtiketService,
  ) {}

  @Post()
  @Roles(Role.member)
  @ResponseMessage(PESAN_RESERVASI.DIBUAT)
  @ApiOperation({ summary: 'Buat pemesanan space baru' })
  buat(
    @Body() dto: CreateReservasiDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.buat(dto, user);
  }

  // Rute tetap `my` dan `my/history` didaftarkan sebelum `:id`, agar "my" tidak
  // dibaca sebagai id reservasi.
  @Get('my')
  @Roles(Role.member)
  @ApiOperation({ summary: 'Seluruh pemesanan milik sendiri' })
  milikSaya(@CurrentUser() user: AuthenticatedUser) {
    return this.reservasiService.milikSaya(user);
  }

  @Get('my/history')
  @Roles(Role.member)
  @ApiOperation({ summary: 'Histori pemesanan per bulan beserta rekapnya' })
  histori(
    @Query() query: HistoryQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.histori(query, user);
  }

  @Get(':id/e-ticket')
  @ResponseMessage(PESAN_RESERVASI.ETIKET_DIMUAT)
  @ApiOperation({ summary: 'E-Ticket reservasi beserta QR code check-in' })
  etiket(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.etiketService.muat(id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail reservasi berdasarkan ID' })
  detail(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.detail(id, user);
  }

  @Patch(':id/cancel')
  @Roles(Role.member)
  @ResponseMessage(PESAN_RESERVASI.DIBATALKAN)
  @ApiOperation({ summary: 'Batalkan pemesanan sendiri' })
  batalkan(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservasiService.batalkan(id, user);
  }
}
