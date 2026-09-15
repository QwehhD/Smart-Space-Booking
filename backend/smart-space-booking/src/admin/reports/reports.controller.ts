import { Controller, Get, Query } from '@nestjs/common';
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
import { ReportQueryDto } from './dto/report-query.dto';
import { AdminReportsService } from './reports.service';

@ApiTags('Admin - Laporan')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'x-maker-key', required: false })
@Roles(Role.admin_space)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get('monthly')
  @ApiOperation({
    summary: 'Rekap estimasi dan realisasi pendapatan per bulan',
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
