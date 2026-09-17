import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { CreateMemberAdminDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.dto';
import { UpdateMemberAdminDto } from './dto/update-member.dto';
import { AdminMembersService } from './members.service';

@ApiTags('Admin - Member')
@ApiBearerAuth('access-token')
@Roles(Role.admin_space)
@Controller('admin/members')
export class AdminMembersController {
  constructor(private readonly membersService: AdminMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar seluruh member' })
  daftar(@Query() query: ListMembersQueryDto) {
    return this.membersService.daftar(query.search?.trim() || undefined);
  }

  @Post()
  @ResponseMessage('Data member baru berhasil ditambahkan!')
  @ApiOperation({ summary: 'Tambah data member baru beserta akun loginnya' })
  buat(@Body() dto: CreateMemberAdminDto) {
    return this.membersService.buat(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail member berdasarkan ID' })
  detail(@Param('id', ParseIdPipe) id: number) {
    return this.membersService.detail(id);
  }

  @Put(':id')
  @ResponseMessage('Data member berhasil diperbarui!')
  @ApiOperation({ summary: 'Perbarui data member, termasuk reset password' })
  perbarui(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateMemberAdminDto,
  ) {
    return this.membersService.perbarui(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Data member berhasil dihapus!')
  @ApiOperation({ summary: 'Hapus data member (soft delete)' })
  hapus(@Param('id', ParseIdPipe) id: number) {
    return this.membersService.hapus(id);
  }
}
