import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { PESAN_SPACE } from '../spaces.constant';
import { AvailabilityService } from './availability.service';
import { CheckAvailabilityQueryDto } from './dto/check-availability.dto';

/**
 * Dipisahkan dari SpacesController dan didaftarkan lebih dulu pada modul, supaya
 * `/api/spaces/availability` tidak tertangkap lebih dulu oleh rute `:id`.
 */
@ApiTags('Katalog Space')
@Public()
@Controller('spaces')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('availability')
  @ResponseMessage(PESAN_SPACE.TERSEDIA)
  @ApiOperation({ summary: 'Cek ketersediaan space pada tanggal dan jam' })
  cek(@Query() query: CheckAvailabilityQueryDto) {
    return this.availabilityService.cek(query);
  }
}
