import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Member, Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/validation.constant';
import { serializeMember } from '../../common/serializers/profil.serializer';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberAdminDto } from './dto/create-member.dto';
import { UpdateMemberAdminDto } from './dto/update-member.dto';

const MEMBER_TIDAK_DITEMUKAN = 'Data member tidak ditemukan!';
const USERNAME_TERPAKAI = 'Username sudah digunakan oleh akun lain!';

@Injectable()
export class AdminMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async daftar(search?: string) {
    const members = await this.prisma.member.findMany({
      where: {
        ...this.belumDihapus(),
        ...(search && {
          OR: [
            { nama_member: { contains: search } },
            { instansi: { contains: search } },
            { telp: { contains: search } },
          ],
        }),
      },
      orderBy: { id: 'asc' },
    });

    return members.map((member) => this.tampilkan(member));
  }

  async detail(id: number) {
    return this.tampilkan(await this.pastikanAda(id));
  }

  /**
   * Membuat akun login sekaligus profilnya dalam satu transaksi, sama seperti
   * registrasi mandiri, supaya tidak pernah ada akun tanpa profil bila salah satu
   * penyimpanan gagal.
   */
  async buat(dto: CreateMemberAdminDto) {
    const member = await this.prisma
      .$transaction(async (tx) => {
        const akun = await tx.user.create({
          data: {
            username: dto.username,
            password: await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
            role: Role.member,
          },
        });

        return tx.member.create({
          data: {
            nama_member: dto.nama_member,
            instansi: dto.instansi,
            alamat: dto.alamat,
            telp: dto.telp,
            foto: dto.foto ?? null,
            id_user: akun.id,
          },
        });
      })
      .catch((error: unknown) => this.terjemahkanUsernameGanda(error));

    return this.tampilkan(member);
  }

  async perbarui(id: number, dto: UpdateMemberAdminDto) {
    const sekarang = await this.pastikanAda(id);

    const member = await this.prisma.member.update({
      where: { id },
      data: {
        nama_member: dto.nama_member,
        instansi: dto.instansi,
        alamat: dto.alamat,
        telp: dto.telp,
        foto: dto.foto,
        // Password diperlakukan sebagai reset oleh admin: hanya ditulis bila
        // dikirim, dan tetap tersimpan sebagai hash seperti jalur lainnya.
        ...(dto.password && {
          user: {
            update: {
              password: await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS),
            },
          },
        }),
      },
    });

    return this.tampilkan({ ...sekarang, ...member });
  }

  /**
   * Soft delete. Reservasi lama masih merujuk ke member ini, sehingga riwayat dan
   * laporan pendapatan harus tetap dapat menyebut siapa penyewanya. Akun login
   * ikut kehilangan akses karena login dan JwtStrategy sama-sama menolak member
   * yang sudah dihapus.
   */
  async hapus(id: number) {
    await this.pastikanAda(id);

    await this.prisma.member.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { id, deleted: true };
  }

  private async pastikanAda(id: number): Promise<Member> {
    const member = await this.prisma.member.findFirst({
      where: { id, ...this.belumDihapus() },
    });

    if (!member) {
      throw new NotFoundException(MEMBER_TIDAK_DITEMUKAN);
    }

    return member;
  }

  /**
   * Member tidak memiliki `id_owner`, sehingga daftar pada panel admin mencakup
   * seluruh member yang belum dihapus, bukan per pengelola. Ini mengikuti sifat
   * datanya: member mendaftar ke aplikasi, bukan ke satu lokasi tertentu.
   */
  private belumDihapus() {
    return { deleted_at: null };
  }

  private terjemahkanUsernameGanda(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(USERNAME_TERPAKAI);
    }

    throw error;
  }

  private tampilkan(member: Member) {
    return serializeMember(
      member,
      this.config.get<string>('appUrl') ?? 'http://localhost:3000',
    );
  }
}
