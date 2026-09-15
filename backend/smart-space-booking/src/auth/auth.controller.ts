import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentMaker } from '../common/decorators/current-maker.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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

  @Public()
  @Post('register/member')
  @ResponseMessage('Registrasi member berhasil!')
  @ApiOperation({ summary: 'Registrasi akun member / pelanggan baru' })
  registerMember(
    @Body() dto: RegisterMemberDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.authService.registerMember(dto, maker);
  }

  @Public()
  @Post('register/admin-space')
  @ResponseMessage('Registrasi Admin Space berhasil!')
  @ApiOperation({ summary: 'Registrasi pengelola lokasi coworking space' })
  registerAdminSpace(
    @Body() dto: RegisterAdminSpaceDto,
    @CurrentMaker() maker: MakerContext,
  ) {
    return this.authService.registerAdminSpace(dto, maker);
  }

  @Public()
  @Post('login')
  // Login tidak membuat sumber daya, jadi statusnya 200 seperti dicontohkan soal,
  // bukan 201 yang diberikan Nest secara otomatis untuk setiap @Post.
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Login berhasil!')
  @ApiOperation({ summary: 'Login akun member atau admin space' })
  login(@Body() dto: LoginDto, @CurrentMaker() maker: MakerContext) {
    return this.authService.login(dto, maker);
  }
}
