import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../common/constants/validation.constant';
import { PrismaService } from '../prisma/prisma.service';
import { MakerContext } from './interfaces/maker-context.interface';
import {
  APP_KEY_PREFIX,
  APP_KEY_RANDOM_BYTES,
  DEFAULT_APP_KEY,
  DEFAULT_MAKER_PROFILE,
  PESAN_MAKER,
} from './maker.constant';

@Injectable()
export class MakerService {
  /**
   * Id maker bawaan di-cache setelah pencarian pertama supaya request tanpa
   * header tidak menimbulkan satu query tambahan setiap kali.
   */
  private idMakerBawaan?: number;

  constructor(private readonly prisma: PrismaService) {}

  /** Membuat app key baru dengan bentuk `mk_` + 32 karakter heksadesimal. */
  static buatAppKey(): string {
    return APP_KEY_PREFIX + randomBytes(APP_KEY_RANDOM_BYTES).toString('hex');
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
