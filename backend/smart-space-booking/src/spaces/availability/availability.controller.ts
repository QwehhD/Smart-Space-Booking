import { Controller, Get, Query } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentMaker } from '../../common/decorators/current-maker.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { MakerContext } from '../../maker/interfaces/maker-context.interface';
import { PESAN_SPACE } from '../spaces.constant';
import { AvailabilityService } from './availability.service';
import { CheckAvailabilityQueryDto } from './dto/check-availability.dto';

/**
 * Dipisahkan dari SpacesController dan didaftarkan lebih dulu pada modul, supaya
 * `/api/spaces/availability` tidak tertangkap lebih dulu oleh rute `:id`.
 */
@ApiTags('Katalog Space')
@ApiHeader({ name: 'x-maker-key', required: false })
@Public()
@Controller('spaces')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('availability')
  @ResponseMessage(PESAN_SPACE.TERSEDIA)
  @ApiOperation({ summary: 'Cek ketersediaan space pada tanggal dan jam' })
  cek(
    @Query() query: CheckAvailabilityQueryDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.availabilityService.cek(query, maker);
  }
}
