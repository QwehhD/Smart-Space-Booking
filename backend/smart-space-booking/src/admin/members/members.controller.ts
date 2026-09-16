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
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { CreateMemberAdminDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members.dto';
import { UpdateMemberAdminDto } from './dto/update-member.dto';
import { AdminMembersService } from './members.service';

@ApiTags('Admin - Member')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'x-maker-key', required: false })
@Roles(Role.admin_space)
@Controller('admin/members')
export class AdminMembersController {
  constructor(private readonly membersService: AdminMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar seluruh member pada tenant ini' })
  daftar(
    @Query() query: ListMembersQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.daftar(user, query.search?.trim() || undefined);
  }

  @Post()
  @ResponseMessage('Data member baru berhasil ditambahkan!')
  @ApiOperation({ summary: 'Tambah data member baru beserta akun loginnya' })
  buat(
    @Body() dto: CreateMemberAdminDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.buat(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail member berdasarkan ID' })
  detail(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.detail(id, user);
  }

  @Put(':id')
  @ResponseMessage('Data member berhasil diperbarui!')
  @ApiOperation({ summary: 'Perbarui data member, termasuk reset password' })
  perbarui(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateMemberAdminDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.perbarui(id, dto, user);
  }

  @Delete(':id')
  @ResponseMessage('Data member berhasil dihapus!')
  @ApiOperation({ summary: 'Hapus data member (soft delete)' })
  hapus(
    @Param('id', ParseIdPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.hapus(id, user);
  }
}
