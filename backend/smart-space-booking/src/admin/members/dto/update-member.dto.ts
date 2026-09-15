import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMemberAdminDto } from './create-member.dto';

/**
 * Semua field opsional, kecuali `username` yang tidak dapat diubah.
 *
 * Username adalah identitas login member, dan soal tidak mencantumkannya pada
 * UpdateMemberAdminDto. Membiarkannya tetap juga menghindari admin diam-diam
 * mengambil alih akun member dengan menukar usernamenya.
 *
 * `password` tetap ada dan berfungsi sebagai reset kata sandi oleh admin.
 */
export class UpdateMemberAdminDto extends PartialType(
  OmitType(CreateMemberAdminDto, ['username'] as const),
) {}
