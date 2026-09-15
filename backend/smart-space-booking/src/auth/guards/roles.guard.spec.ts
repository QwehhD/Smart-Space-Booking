import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RolesGuard } from './roles.guard';

/**
 * Sama seperti JwtStrategy, keputusan guard ini tidak tampak dari bentuk response
 * sehingga diuji langsung. Yang paling penting dijaga adalah endpoint ber-@Roles
 * yang keliru ditandai publik harus menolak, bukan meloloskan.
 */
describe('RolesGuard', () => {
  const member: AuthenticatedUser = {
    id: 7,
    username: 'johndoe',
    role: Role.member,
    id_maker: 1,
    member_id: 6,
  };

  const admin: AuthenticatedUser = {
    id: 8,
    username: 'admin_space1',
    role: Role.admin_space,
    id_maker: 1,
    owner_id: 3,
  };

  const context = (user?: AuthenticatedUser) =>
    ({
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  const guard = (roleDiizinkan?: Role[]) =>
    new RolesGuard({
      getAllAndOverride: () => roleDiizinkan,
    } as unknown as Reflector);

  it('meloloskan endpoint yang tidak membatasi role', () => {
    expect(guard(undefined).canActivate(context(member))).toBe(true);
  });

  it('meloloskan endpoint yang daftar rolenya kosong', () => {
    expect(guard([]).canActivate(context(member))).toBe(true);
  });

  it('meloloskan pengguna dengan role yang diizinkan', () => {
    expect(guard([Role.admin_space]).canActivate(context(admin))).toBe(true);
  });

  it('meloloskan pengguna bila endpoint mengizinkan beberapa role', () => {
    const izin = [Role.member, Role.admin_space];

    expect(guard(izin).canActivate(context(member))).toBe(true);
    expect(guard(izin).canActivate(context(admin))).toBe(true);
  });

  it('menolak member pada endpoint khusus admin space', () => {
    expect(() =>
      guard([Role.admin_space]).canActivate(context(member)),
    ).toThrow(ForbiddenException);
  });

  it('menolak bila pengguna tidak ada, misalnya endpoint keliru ditandai publik', () => {
    expect(() => guard([Role.admin_space]).canActivate(context())).toThrow(
      ForbiddenException,
    );
  });
});
