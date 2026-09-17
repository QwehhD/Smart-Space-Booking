import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtStrategy } from './jwt.strategy';

/**
 * Strategy ini memuat pemeriksaan yang tidak terlihat dari bentuk response, yaitu
 * penolakan token milik akun yang sudah dihapus. Karena itu diuji langsung di
 * tingkat unit, tidak lewat HTTP.
 */
describe('JwtStrategy', () => {
  let findUnique: jest.Mock;
  let strategy: JwtStrategy;

  const payload = (ubah: Partial<JwtPayload> = {}): JwtPayload => ({
    sub: 7,
    username: 'johndoe',
    role: Role.member,
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
      member: { id: 6, deleted_at: null },
      space_owner: null,
    });

    await expect(strategy.validate(payload())).resolves.toEqual({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      member_id: 6,
      owner_id: undefined,
    });
  });

  it('menerima token admin space dan menyertakan owner_id', async () => {
    findUnique.mockResolvedValue({
      id: 8,
      username: 'admin_space1',
      role: Role.admin_space,
      member: null,
      space_owner: { id: 3 },
    });

    await expect(
      strategy.validate(payload({ role: Role.admin_space })),
    ).resolves.toMatchObject({ owner_id: 3, member_id: undefined });
  });

  it('menolak token milik akun yang sudah tidak ada', async () => {
    findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('menolak token member yang sudah di-soft-delete', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      member: { id: 6, deleted_at: new Date() },
      space_owner: null,
    });

    await expect(strategy.validate(payload())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  /** Akun dibaca ulang setiap request, bukan dipercaya dari isi token. */
  it('selalu membaca ulang akun dari database', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      username: 'johndoe',
      role: Role.member,
      member: { id: 6, deleted_at: null },
      space_owner: null,
    });

    await strategy.validate(payload());

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 7 } }),
    );
  });
});
