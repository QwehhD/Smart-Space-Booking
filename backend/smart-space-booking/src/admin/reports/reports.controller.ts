import { Controller, Get, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ReportQueryDto } from './dto/report-query.dto';
import { AdminReportsService } from './reports.service';

@ApiTags('Admin - Laporan')
@ApiBearerAuth('access-token')
@Roles(Role.admin_space)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get('monthly')
  @ApiOperation({
    summary: 'Rekap estimasi dan realisasi pendapatan per bulan',
    description:
      'Mengembalikan month, year, total_transaksi, total_jam_terpakai, ' +
      'estimasi_pendapatan_kotor, total_potongan_diskon, realisasi_pendapatan_bersih, ' +
      'rincian_per_tipe_space (selalu ketiga tipe), dan pendapatan_per_hari. ' +
      'pendapatan_per_hari memuat setiap hari dalam bulan tersebut, hari tanpa ' +
      'transaksi bernilai 0, dan jumlah seluruhnya sama dengan ' +
      'realisasi_pendapatan_bersih.',
  })
  bulanan(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.bulanan(query, user);
  }

  @Get('income')
  @ApiOperation({ summary: 'Alias ringkas rekap pendapatan bulanan' })
  pendapatan(
    @Query() query: ReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reportsService.pendapatan(query, user);
  }
}
