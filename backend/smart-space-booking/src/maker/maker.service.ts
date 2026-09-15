import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, StatusReservasi } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/validation.constant';
import { PrismaService } from '../prisma/prisma.service';
import { LoginMakerDto } from './dto/login-maker.dto';
import { RegisterMakerDto } from './dto/register-maker.dto';
import { MakerAccount } from './interfaces/maker-account.interface';
import { MakerContext } from './interfaces/maker-context.interface';
import {
  MAKER_TOKEN_TYPE,
  MakerJwtPayload,
} from './interfaces/maker-jwt-payload.interface';
import {
  serializeMaker,
  serializeMakerBaru,
  serializeMakerLogin,
} from './maker.serializer';
import {
  APP_KEY_PREFIX,
  APP_KEY_RANDOM_BYTES,
  DEFAULT_APP_KEY,
  DEFAULT_MAKER_PROFILE,
  PESAN_MAKER,
} from './maker.constant';

/** Kolom akun maker yang boleh dibaca keluar dari service ini. */
const KOLOM_PUBLIK = {
  id: true,
  name: true,
  username: true,
  email: true,
  app_key: true,
  created_at: true,
} as const;

@Injectable()
export class MakerService {
  /**
   * Id maker bawaan di-cache setelah pencarian pertama supaya request tanpa
   * header tidak menimbulkan satu query tambahan setiap kali.
   */
  private idMakerBawaan?: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Membuat app key baru dengan bentuk `mk_` + 32 karakter heksadesimal. */
  static buatAppKey(): string {
    return APP_KEY_PREFIX + randomBytes(APP_KEY_RANDOM_BYTES).toString('hex');
  }

  async register(dto: RegisterMakerDto) {
    const maker = await this.prisma.maker
      .create({
        data: {
          name: dto.name,
          username: dto.username,
          email: dto.email,
          password: await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
          app_key: MakerService.buatAppKey(),
        },
        select: { ...KOLOM_PUBLIK, updated_at: true },
      })
      .catch((error: unknown) => this.terjemahkanIdentitasGanda(error));

    return {
      ...serializeMakerBaru(maker),
      access_token: this.terbitkanToken(maker),
    };
  }

  async login(dto: LoginMakerDto) {
    const maker = await this.prisma.maker.findFirst({
      where: {
        OR: [{ username: dto.usernameOrEmail }, { email: dto.usernameOrEmail }],
      },
    });

    // Password tetap dibandingkan walau akun tidak ditemukan supaya lama respons
    // tidak membocorkan username mana yang terdaftar.
    const cocok = await bcrypt.compare(
      dto.password,
      maker?.password ?? PASSWORD_UMPAN,
    );

    if (!maker || !cocok) {
      throw new UnauthorizedException(PESAN_MAKER.KREDENSIAL_SALAH);
    }

    return {
      ...serializeMakerLogin(maker),
      access_token: this.terbitkanToken(maker),
    };
  }

  /** Dipakai MakerAuthGuard untuk memastikan akun pemilik token masih ada. */
  cariAkunById(id: number): Promise<MakerAccount | null> {
    return this.prisma.maker.findUnique({
      where: { id },
      select: KOLOM_PUBLIK,
    });
  }

  /** `GET /api/maker/list` — panel guru, sengaja publik sesuai soal. */
  async daftar() {
    const makers = await this.prisma.maker.findMany({
      select: KOLOM_PUBLIK,
      orderBy: { id: 'asc' },
    });

    return makers.map((maker) => serializeMaker(maker));
  }

  /**
   * Rekap jumlah data milik satu tenant. Data yang sudah di-soft-delete tidak
   * ikut dihitung karena bagi siswa data tersebut sudah tidak ada.
   */
  async statistik(idMaker: number) {
    const [members, spaces, diskon, reservasi, pendapatan] = await Promise.all([
      this.prisma.member.count({
        where: { id_maker: idMaker, deleted_at: null },
      }),
      this.prisma.space.count({
        where: { id_maker: idMaker, deleted_at: null },
      }),
      this.prisma.diskon.count({
        where: { id_maker: idMaker, deleted_at: null },
      }),
      this.prisma.reservasi.count({ where: { id_maker: idMaker } }),
      this.prisma.detailReservasi.aggregate({
        _sum: { total_harga: true },
        where: {
          reservasi: {
            id_maker: idMaker,
            status: { not: StatusReservasi.dibatalkan },
          },
        },
      }),
    ]);

    return {
      total_members: members,
      total_spaces: spaces,
      total_diskon: diskon,
      total_reservasi: reservasi,
      total_pendapatan: pendapatan._sum.total_harga ?? 0,
    };
  }

  /**
   * Menerjemahkan app key dari header menjadi tenant pemilik data.
   *
   * Request tanpa header diarahkan ke maker bawaan agar endpoint publik tetap
   * bisa dicoba tanpa mendaftar lebih dulu. Sebaliknya app key yang dikirim tapi
   * tidak dikenal ditolak, supaya salah ketik satu karakter tidak diam-diam
   * menulis data ke tenant lain.
   */
  async resolveByAppKey(appKey?: string): Promise<MakerContext> {
    if (!appKey) {
      return this.makerBawaan();
    }

    const maker = await this.prisma.maker.findUnique({
      where: { app_key: appKey },
      select: { id: true, app_key: true },
    });

    if (!maker) {
      throw new UnauthorizedException(PESAN_MAKER.APP_KEY_TIDAK_DIKENAL);
    }

    return maker;
  }

  private terbitkanToken(maker: {
    id: number;
    username: string;
    app_key: string;
  }): string {
    const payload: MakerJwtPayload = {
      sub: maker.id,
      username: maker.username,
      app_key: maker.app_key,
      type: MAKER_TOKEN_TYPE,
    };

    return this.jwt.sign(payload);
  }

  /**
   * Username dan email sama-sama unik, tetapi soal hanya menyediakan satu pesan
   * untuk keduanya, sehingga keduanya dijawab dengan pesan yang sama.
   */
  private terjemahkanIdentitasGanda(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(PESAN_MAKER.IDENTITAS_TERPAKAI);
    }

    throw error;
  }

  /**
   * Maker bawaan dibuat saat pertama kali dibutuhkan, bukan saat aplikasi boot,
   * supaya aplikasi tetap dapat dijalankan (dan /health tetap dapat melaporkan
   * database mati) ketika database belum siap.
   */
  private async makerBawaan(): Promise<MakerContext> {
    if (this.idMakerBawaan !== undefined) {
      return { id: this.idMakerBawaan, app_key: DEFAULT_APP_KEY };
    }

    const maker = await this.prisma.maker.upsert({
      where: { app_key: DEFAULT_APP_KEY },
      update: {},
      create: {
        ...DEFAULT_MAKER_PROFILE,
        // Maker bawaan hanya berfungsi sebagai wadah data, bukan akun yang
        // dipakai login, jadi passwordnya diacak dan tidak pernah dicatat.
        password: await bcrypt.hash(
          randomBytes(32).toString('hex'),
          BCRYPT_SALT_ROUNDS,
        ),
      },
      select: { id: true, app_key: true },
    });

    this.idMakerBawaan = maker.id;
    return maker;
  }
}

/**
 * Hash tak bermakna untuk dibandingkan ketika akun tidak ditemukan, agar biaya
 * bcrypt tetap dikeluarkan dan waktu respons login tidak dapat dipakai menebak
 * username yang terdaftar.
 */
const PASSWORD_UMPAN = '$2b$10$' + 'x'.repeat(53);
