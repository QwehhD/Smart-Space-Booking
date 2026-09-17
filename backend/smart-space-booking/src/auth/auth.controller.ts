import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthThrottlerGuard } from '../common/guards/auth-throttler.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { RegisterMemberDto } from './dto/register-member.dto';

@ApiTags('Autentikasi')
// Pembatasan laju hanya dipasang di controller ini, bukan global, karena yang
// perlu dilindungi dari percobaan berulang adalah login dan registrasi.
@UseGuards(AuthThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register/member')
  @ResponseMessage('Registrasi member berhasil!')
  @ApiOperation({ summary: 'Registrasi akun member / pelanggan baru' })
  registerMember(@Body() dto: RegisterMemberDto) {
    return this.authService.registerMember(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register/admin-space')
  @ResponseMessage('Registrasi Admin Space berhasil!')
  @ApiOperation({ summary: 'Registrasi pengelola lokasi coworking space' })
  registerAdminSpace(@Body() dto: RegisterAdminSpaceDto) {
    return this.authService.registerAdminSpace(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  // Login tidak membuat sumber daya, jadi statusnya 200 seperti dicontohkan soal,
  // bukan 201 yang diberikan Nest secara otomatis untuk setiap @Post.
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login berhasil!')
  @ApiOperation({ summary: 'Login akun member atau admin space' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Profil dan hak akses pengguna yang sedang login' })
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.profile(user.id);
  }
}
