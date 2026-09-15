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
import { MakerContext } from '../maker/interfaces/maker-context.interface';
import { PrismaService } from '../prisma/prisma.service';
import { serializeMember, serializeSpaceOwner } from './auth.serializer';
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

  async registerMember(dto: RegisterMemberDto, maker: MakerContext) {
    await this.pastikanUsernameBelumDipakai(dto.username, maker.id);

    const { user, member } = await this.prisma
      .$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: dto.username,
            password: await this.hashPassword(dto.password),
            role: Role.member,
            id_maker: maker.id,
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
            id_maker: maker.id,
          },
        });

        return { user, member };
      })
      .catch((error: unknown) => this.terjemahkanUsernameGanda(error));

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      member: serializeMember(member, this.appUrl),
      access_token: this.terbitkanToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        maker_id: maker.id,
        member_id: member.id,
      }),
    };
  }

  async registerAdminSpace(dto: RegisterAdminSpaceDto, maker: MakerContext) {
    await this.pastikanUsernameBelumDipakai(dto.username, maker.id);

    const { user, owner } = await this.prisma
      .$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: dto.username,
            password: await this.hashPassword(dto.password),
            role: Role.admin_space,
            id_maker: maker.id,
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
            id_maker: maker.id,
          },
        });

        return { user, owner };
      })
      .catch((error: unknown) => this.terjemahkanUsernameGanda(error));

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      space_owner: serializeSpaceOwner(owner, this.appUrl),
      access_token: this.terbitkanToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        maker_id: maker.id,
        owner_id: owner.id,
      }),
    };
  }

  /**
   * Login dicari di dalam tenant yang aktif, karena username hanya unik per
   * maker sehingga username yang sama bisa dimiliki akun di tenant lain.
   */
  async login(dto: LoginDto, maker: MakerContext) {
    const user = await this.prisma.user.findUnique({
      where: {
        id_maker_username: { id_maker: maker.id, username: dto.username },
      },
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
      maker_id: user.id_maker,
      // Soal mencontohkan kedua kunci selalu ada pada response login, yang tidak
      // relevan bernilai null, sehingga frontend tidak perlu memeriksa role dulu.
      member: user.member ? serializeMember(user.member, this.appUrl) : null,
      space_owner: user.space_owner
        ? serializeSpaceOwner(user.space_owner, this.appUrl)
        : null,
      access_token: this.terbitkanToken({
        sub: user.id,
        username: user.username,
        role: user.role,
        maker_id: user.id_maker,
        member_id: user.member?.id,
        owner_id: user.space_owner?.id,
      }),
    };
  }

  /**
   * Profil pengguna yang sedang login. Berbeda dengan login, soal hanya
   * mencantumkan kunci profil yang relevan dengan role, tanpa `maker_id` dan
   * tanpa kunci lawannya yang bernilai null.
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
        member: serializeMember(user.member, this.appUrl),
      }),
      ...(user.space_owner && {
        space_owner: serializeSpaceOwner(user.space_owner, this.appUrl),
      }),
    };
  }

  private get appUrl(): string {
    return this.config.get<string>('appUrl') ?? 'http://localhost:3000';
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  private terbitkanToken(payload: JwtPayload): string {
    return this.jwt.sign(payload);
  }

  /**
   * Username hanya perlu unik di dalam satu maker, sehingga dua siswa yang
   * mengerjakan UKK dapat memakai username contoh yang sama tanpa bertabrakan.
   */
  private async pastikanUsernameBelumDipakai(
    username: string,
    idMaker: number,
  ): Promise<void> {
    const terpakai = await this.prisma.user.findUnique({
      where: { id_maker_username: { id_maker: idMaker, username } },
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
