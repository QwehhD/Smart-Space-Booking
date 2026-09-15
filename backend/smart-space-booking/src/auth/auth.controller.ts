import { Body, Controller, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentMaker } from '../common/decorators/current-maker.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { AuthService } from './auth.service';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { RegisterMemberDto } from './dto/register-member.dto';

@ApiTags('Autentikasi')
@ApiHeader({
  name: 'x-maker-key',
  required: false,
  description:
    'App key pemilik data. Bila dikosongkan, data masuk ke maker bawaan.',
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/member')
  @ResponseMessage('Registrasi member berhasil!')
  @ApiOperation({ summary: 'Registrasi akun member / pelanggan baru' })
  registerMember(
    @Body() dto: RegisterMemberDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.authService.registerMember(dto, maker);
  }

  @Post('register/admin-space')
  @ResponseMessage('Registrasi Admin Space berhasil!')
  @ApiOperation({ summary: 'Registrasi pengelola lokasi coworking space' })
  registerAdminSpace(
    @Body() dto: RegisterAdminSpaceDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.authService.registerAdminSpace(dto, maker);
  }
}
