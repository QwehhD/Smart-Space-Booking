import { PartialType } from '@nestjs/swagger';
import { CreateSpaceDto } from './create-space.dto';

/**
 * Seluruh field opsional sesuai UpdateSpaceDto pada soal. Field yang tidak
 * dikirim tidak diubah, sehingga pembaruan sebagian tidak menghapus data lain.
 */
export class UpdateSpaceDto extends PartialType(CreateSpaceDto) {}
