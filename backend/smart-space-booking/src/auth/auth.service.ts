import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/validation.constant';
import { PrismaService } from '../prisma/prisma.service';
import {
  serializeMember,
  serializeSpaceOwner,
} from '../common/serializers/profil.serializer';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminSpaceDto } from './dto/register-admin-space.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const USERNAME_TERPAKAI = 'Username sudah digunakan oleh akun lain!';
const KREDENSIAL_SALAH = 'Username atau Password salah!';

/**
 * Hash tak bermakna untuk dibandingkan ketika akun tidak ditemukan, agar biaya
 * bcrypt tetap dikeluarkan dan lama respons login tidak dapat dipakai menebak
 * username mana yang terdaftar.
 */
const PASSWORD_UMPAN = '$2b$10$' + 'x'.repeat(53);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async registerMember(dto: RegisterMemberDto) {
    await this.pastikanUsernameBelumDipakai(dto.username);

    const { user, member } = await this.prisma
      .$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: dto.username,
            password: await this.hashPassword(dto.password),
            role: Role.member,
          },
        });

        const member = await tx.member.create({
          data: {
            nama_member: dto.nama_member,
            instansi: dto.instansi,
            alamat: dto.alamat,
            telp: dto.telp,
            foto: dto.foto ?? null,
            id_user: user.id,
          },
        });

        return { user, member };
      })
      .catch((error: unknown) => this.terjemahkanUsernameGanda(error));

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      member: serializeMember(member, this.fotoBaseUrl),
      access_token: this.terbitkanToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        member_id: member.id,
      }),
    };
  }

  async registerAdminSpace(dto: RegisterAdminSpaceDto) {
    await this.pastikanUsernameBelumDipakai(dto.username);

    const { user, owner } = await this.prisma
      .$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: dto.username,
            password: await this.hashPassword(dto.password),
            role: Role.admin_space,
          },
        });

        const owner = await tx.spaceOwner.create({
          data: {
            nama_coworking: dto.nama_coworking,
            nama_pemilik: dto.nama_pemilik,
            telp: dto.telp,
            alamat: dto.alamat ?? null,
            deskripsi: dto.deskripsi ?? null,
            foto: dto.foto ?? null,
            id_user: user.id,
          },
        });

        return { user, owner };
      })
      .catch((error: unknown) => this.terjemahkanUsernameGanda(error));

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      space_owner: serializeSpaceOwner(owner, this.fotoBaseUrl),
      access_token: this.terbitkanToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        owner_id: owner.id,
      }),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: { member: true, space_owner: true },
    });

    const cocok = await bcrypt.compare(
      dto.password,
      user?.password ?? PASSWORD_UMPAN,
    );

    // Member yang sudah di-soft-delete diperlakukan seperti akun yang tidak ada,
    // supaya admin yang menghapus member benar-benar mencabut aksesnya.
    if (!user || !cocok || user.member?.deleted_at) {
      throw new UnauthorizedException(KREDENSIAL_SALAH);
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      // Soal mencontohkan kedua kunci selalu ada pada response login, yang tidak
      // relevan bernilai null, sehingga frontend tidak perlu memeriksa role dulu.
      member: user.member
        ? serializeMember(user.member, this.fotoBaseUrl)
        : null,
      space_owner: user.space_owner
        ? serializeSpaceOwner(user.space_owner, this.fotoBaseUrl)
        : null,
      access_token: this.terbitkanToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        member_id: user.member?.id,
        owner_id: user.space_owner?.id,
      }),
    };
  }

  /**
   * Profil pengguna yang sedang login. Berbeda dengan login, soal hanya
   * mencantumkan kunci profil yang relevan dengan role, tanpa kunci lawannya
   * yang bernilai null.
   */
  async profile(idUser: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: idUser },
      include: { member: true, space_owner: true },
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      ...(user.member && {
        member: serializeMember(user.member, this.fotoBaseUrl),
      }),
      ...(user.space_owner && {
        space_owner: serializeSpaceOwner(user.space_owner, this.fotoBaseUrl),
      }),
    };
  }

  private get fotoBaseUrl(): string {
    return this.config.getOrThrow<string>('foto.baseUrl');
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  private terbitkanToken(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }

  private async pastikanUsernameBelumDipakai(username: string): Promise<void> {
    const terpakai = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (terpakai) {
      throw new BadRequestException(USERNAME_TERPAKAI);
    }
  }

  /**
   * Pengecekan username di awal masih bisa kalah balapan dengan request lain
   * yang mendaftar bersamaan, sehingga pelanggaran unique dari database tetap
   * diterjemahkan ke pesan yang sama.
   */
  private terjemahkanUsernameGanda(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(USERNAME_TERPAKAI);
    }

    throw error;
  }
}
