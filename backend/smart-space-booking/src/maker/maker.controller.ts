import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentMaker } from '../common/decorators/current-maker.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { SkipMakerContext } from '../common/decorators/skip-maker-context.decorator';
import { CurrentMakerAccount } from './decorators/current-maker-account.decorator';
import { LoginMakerDto } from './dto/login-maker.dto';
import { RegisterMakerDto } from './dto/register-maker.dto';
import { MakerAuthGuard } from './guards/maker-auth.guard';
import { MakerScopeGuard } from './guards/maker-scope.guard';
import { MakerAccount } from './interfaces/maker-account.interface';
import { MakerContext } from './interfaces/maker-context.interface';
import { serializeMaker } from './maker.serializer';
import { MakerService } from './maker.service';

/**
 * Pengelolaan akun siswa pengembang frontend.
 *
 * Seluruh controller ditandai @SkipMakerContext() karena endpoint di sini
 * mengelola akun maker itu sendiri, bukan data di dalam satu tenant. Kalau guard
 * tenant global tetap berjalan, `POST /api/maker/register` akan ditolak lebih dulu
 * ketika frontend masih menyimpan app key lama yang sudah tidak berlaku.
 */
@ApiTags('App Maker')
@SkipMakerContext()
@Public()
@Controller('maker')
export class MakerController {
  constructor(private readonly makerService: MakerService) {}

  @Post('register')
  @ResponseMessage(
    'Registrasi App Maker berhasil! Simpan app_key Anda dengan baik.',
  )
  @ApiOperation({ summary: 'Registrasi akun siswa dan penerbitan app key' })
  register(@Body() dto: RegisterMakerDto) {
    return this.makerService.register(dto);
  }

  @Post('login')
  // Login bukan pembuatan data, sehingga statusnya 200 seperti dicontohkan soal,
  // bukan 201 yang diberikan Nest secara otomatis untuk setiap @Post.
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login App Maker berhasil!')
  @ApiOperation({ summary: 'Login akun siswa dengan username atau email' })
  login(@Body() dto: LoginMakerDto) {
    return this.makerService.login(dto);
  }

  @Get('me')
  @UseGuards(MakerAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil dan app key siswa yang sedang login' })
  me(@CurrentMakerAccount() maker: MakerAccount) {
    return serializeMaker(maker);
  }

  @Get('stats')
  @UseGuards(MakerScopeGuard)
  @ApiBearerAuth('access-token')
  @ApiHeader({
    name: 'x-maker-key',
    required: false,
    description: 'Alternatif autentikasi bila tidak memakai bearer token.',
  })
  @ApiOperation({ summary: 'Rekap jumlah data milik siswa' })
  stats(@CurrentMaker() maker: MakerContext) {
    return this.makerService.statistik(maker.id);
  }

  @Get('list')
  @ApiOperation({ summary: 'Daftar seluruh siswa terdaftar (panel guru)' })
  list() {
    return this.makerService.daftar();
  }
}
