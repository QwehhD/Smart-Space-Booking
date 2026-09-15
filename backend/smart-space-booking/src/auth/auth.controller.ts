import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { RegisterMemberDto } from './dto/register-member.dto';

@ApiTags('Autentikasi')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/member')
  @ResponseMessage('Registrasi member berhasil!')
  @ApiOperation({ summary: 'Registrasi akun member / pelanggan baru' })
  registerMember(@Body() dto: RegisterMemberDto) {
    return this.authService.registerMember(dto);
  }

  @Post('register/admin-space')
  @ResponseMessage('Registrasi Admin Space berhasil!')
  @ApiOperation({ summary: 'Registrasi pengelola lokasi coworking space' })
  registerAdminSpace(@Body() dto: RegisterAdminSpaceDto) {
    return this.authService.registerAdminSpace(dto);
  }
}
