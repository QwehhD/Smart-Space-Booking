import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

const TOKEN_TIDAK_VALID = 'Token tidak valid atau sudah kedaluwarsa!';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.secret') ?? '',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Akun dibaca ulang supaya token milik akun yang sudah dihapus berhenti
    // berlaku seketika, tidak menunggu masa berlakunya habis.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        role: true,
        member: { select: { id: true, deleted_at: true } },
        space_owner: { select: { id: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException(TOKEN_TIDAK_VALID);
    }

    // Member yang sudah di-soft-delete tidak boleh melanjutkan sesi yang sudah
    // berjalan, karena bagi admin akun itu sudah dihapus.
    if (user.member?.deleted_at) {
      throw new UnauthorizedException(TOKEN_TIDAK_VALID);
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      member_id: user.member?.id,
      owner_id: user.space_owner?.id,
    };
  }
}
