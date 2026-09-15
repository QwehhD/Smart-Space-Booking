import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RequestWithMaker } from '../../common/interfaces/request-with-maker.interface';
import { MAKER_TOKEN_TYPE } from '../../maker/interfaces/maker-jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

/**
 * Strategy ini memuat pemeriksaan yang tidak terlihat dari bentuk response, yaitu
 * penolakan token maker, token lintas tenant, dan akun yang sudah dihapus. Karena
 * itu diuji langsung di tingkat unit, tidak lewat HTTP.
 */
describe('JwtStrategy', () => {
  const MAKER_AKTIF = { id: 1, app_key: 'mk_satu' };

  let findUnique: jest.Mock;
  let strategy: JwtStrategy;

  const request = (maker = MAKER_AKTIF) =>
    ({ maker }) as unknown as RequestWithMaker;

  const payload = (ubah: Partial<JwtPayload> = {}): JwtPayload => ({
    sub: 7,
    username: 'johndoe',
    role: Role.member,
    maker_id: 1,
    ...ubah,
  });

  beforeEach(() => {
    findUnique = jest.fn();
    strategy = new JwtStrategy(
      { get: () => 'secret-untuk-test' } as unknown as ConfigService,
      { user: { findUnique } } as unknown as PrismaService,
    );
  });

  it('menerima token member yang sah dan menyertakan id profilnya', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      id_maker: 1,
      member: { id: 6, deleted_at: null },
      space_owner: null,
    });

    await expect(strategy.validate(request(), payload())).resolves.toEqual({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      id_maker: 1,
      member_id: 6,
      owner_id: undefined,
    });
  });

  it('menerima token admin space dan menyertakan owner_id', async () => {
    findUnique.mockResolvedValue({
      id: 8,
      username: 'admin_space1',
      role: Role.admin_space,
      id_maker: 1,
      member: null,
      space_owner: { id: 3 },
    });

    await expect(
      strategy.validate(request(), payload({ role: Role.admin_space })),
    ).resolves.toMatchObject({ owner_id: 3, member_id: undefined });
  });

  it('menolak token akun maker walau ditandatangani secret yang sama', async () => {
    await expect(
      strategy.validate(request(), payload({ type: MAKER_TOKEN_TYPE })),
    ).rejects.toThrow(UnauthorizedException);

    // Token maker ditolak sebelum menyentuh database.
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('menolak token milik akun yang sudah tidak ada', async () => {
    findUnique.mockResolvedValue(null);

    await expect(strategy.validate(request(), payload())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('menolak token satu tenant yang dipakai bersama app key tenant lain', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      id_maker: 2,
      member: { id: 6, deleted_at: null },
      space_owner: null,
    });

    await expect(strategy.validate(request(), payload())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('menolak token member yang sudah di-soft-delete', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      id_maker: 1,
      member: { id: 6, deleted_at: new Date() },
      space_owner: null,
    });

    await expect(strategy.validate(request(), payload())).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
