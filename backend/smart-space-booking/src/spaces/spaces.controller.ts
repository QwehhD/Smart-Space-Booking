import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentMaker } from '../common/decorators/current-maker.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { ListSpacesQueryDto } from './dto/list-spaces.dto';
import { SpacesService } from './spaces.service';

@ApiTags('Katalog Space')
@ApiHeader({ name: 'x-maker-key', required: false })
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
  daftar(
    @Query() query: ListSpacesQueryDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.spacesService.daftar(query, maker);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail space berdasarkan ID' })
  detail(
    @Param('id', ParseIdPipe) id: number,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.spacesService.detail(id, maker);
  }
}
