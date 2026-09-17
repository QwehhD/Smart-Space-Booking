import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ListSpacesQueryDto } from './dto/list-spaces.dto';
import { SpacesService } from './spaces.service';

@ApiTags('Katalog Space')
@Public()
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  // Rute tetap ini harus berada sebelum `:id`, agar "types" tidak diperlakukan
  // sebagai id space.
  @Get('types')
  @ApiOperation({ summary: 'Daftar tipe space beserta keterangannya' })
  tipe() {
    return this.spacesService.tipe();
  }

  @Get()
  @ApiOperation({
    summary: 'Katalog seluruh space, dengan filter tipe dan pencarian',
  })
  daftar(@Query() query: ListSpacesQueryDto) {
    return this.spacesService.daftar(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail space berdasarkan ID' })
  detail(@Param('id', ParseIdPipe) id: number) {
    return this.spacesService.detail(id);
  }
}
