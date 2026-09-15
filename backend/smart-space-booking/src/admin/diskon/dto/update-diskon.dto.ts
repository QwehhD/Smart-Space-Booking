import { PartialType } from '@nestjs/swagger';
import { CreateDiskonDto } from './create-diskon.dto';

/**
 * Seluruh field opsional sesuai UpdateDiskonDto pada soal. Contoh pada soal
 * hanya mengirim sebagian, misalnya memperpanjang `tanggal_akhir` saja.
 */
export class UpdateDiskonDto extends PartialType(CreateDiskonDto) {}
