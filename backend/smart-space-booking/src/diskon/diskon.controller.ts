import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentMaker } from '../common/decorators/current-maker.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { DiskonService } from './diskon.service';
import { CheckPromoDto } from './dto/check-promo.dto';
import { ListDiskonQueryDto } from './dto/list-diskon.dto';

@ApiTags('Katalog Diskon')
@ApiHeader({ name: 'x-maker-key', required: false })
@Public()
@Controller('diskon')
export class DiskonController {
  constructor(private readonly diskonService: DiskonService) {}

  // Rute tetap didahulukan agar "active" tidak dibaca sebagai id diskon.
  @Get('active')
  @ApiOperation({
    summary: 'Daftar promo yang sedang aktif, dapat disaring per space',
  })
  aktif(
    @Query() query: ListDiskonQueryDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.diskonService.aktif(maker, query);
  }

  @Post('check')
  // Pemeriksaan kode promo tidak membuat data apa pun, sehingga statusnya 200
  // seperti dicontohkan soal, bukan 201 bawaan @Post.
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Kode promo valid dan masih berlaku!')
  @ApiOperation({ summary: 'Periksa validitas kode promo' })
  periksa(@Body() dto: CheckPromoDto, @CurrentMaker() maker: MakerContext) {
    return this.diskonService.periksa(dto, maker);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail diskon berdasarkan ID' })
  detail(
    @Param('id', ParseIdPipe) id: number,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.diskonService.detail(id, maker);
  }
}
