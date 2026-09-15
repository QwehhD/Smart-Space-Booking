import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { SkipMakerContext } from './common/decorators/skip-maker-context.decorator';

@ApiTags('Root & Health Check')
@Controller()
@SkipMakerContext()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Informasi API dan tautan dokumentasi' })
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Status server beserta koneksi database' })
  getHealth() {
    return this.appService.getHealth();
  }
}
