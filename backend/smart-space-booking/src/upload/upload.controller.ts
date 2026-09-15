import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { opsiUpload } from './upload.storage';
import { UploadService } from './upload.service';

/** Skema multipart untuk Swagger, sama untuk ketiga endpoint. */
const BODY_BERKAS = {
  schema: {
    type: 'object',
    properties: { file: { type: 'string', format: 'binary' } },
    required: ['file'],
  },
};

/**
 * Ketiga endpoint ditandai @Public() mengikuti kontrak rincinya pada soal, yang
 * menyebut "Auth: Tidak diperlukan / Header x-maker-key". Ringkasan daftar
 * endpoint menyebut sebagian di antaranya milik Admin Space, namun kontrak rinci
 * yang lebih spesifik dipakai sebagai acuan.
 */
@ApiTags('Upload Berkas')
@ApiHeader({ name: 'x-maker-key', required: false })
@Public()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', opsiUpload('general')))
  @ApiConsumes('multipart/form-data')
  @ApiBody(BODY_BERKAS)
  @ResponseMessage('File berhasil diupload')
  @ApiOperation({ summary: 'Unggah berkas gambar umum' })
  image(@UploadedFile() file?: Express.Multer.File) {
    return this.uploadService.hasilLengkap(file);
  }

  @Post('spaces')
  @UseInterceptors(FileInterceptor('file', opsiUpload('spaces')))
  @ApiConsumes('multipart/form-data')
  @ApiBody(BODY_BERKAS)
  @ResponseMessage('Foto space berhasil diupload')
  @ApiOperation({ summary: 'Unggah foto ruangan atau meja space' })
  spaces(@UploadedFile() file?: Express.Multer.File) {
    return this.uploadService.hasilRingkas(file, 'spaces');
  }

  @Post('members')
  @UseInterceptors(FileInterceptor('file', opsiUpload('members')))
  @ApiConsumes('multipart/form-data')
  @ApiBody(BODY_BERKAS)
  @ResponseMessage('Foto member berhasil diupload')
  @ApiOperation({ summary: 'Unggah foto profil member' })
  members(@UploadedFile() file?: Express.Multer.File) {
    return this.uploadService.hasilRingkas(file, 'members');
  }
}
