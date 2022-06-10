import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dtos/index.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('成员')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: '获取成员' })
  async getAllMembers(
    @Headers('project_id') projectId: string,
    @Query() query: any,
  ) {
    const { project_id, ...rest } = query;

    return await this.membersService.getMembers({
      project_id: +project_id || +projectId,
      ...rest,
    });
  }

  @Get('admin/:id')
  @ApiOperation({ summary: '获取单个成员' })
  async getProjectAdmin(@Param('id') id) {
    return await this.membersService.getProjectAdmin(+id);
  }

  @Post()
  @ApiOperation({ summary: '新建成员' })
  async insertMember(@Body() createMemberDto: CreateMemberDto) {
    return await this.membersService.insertMember(createMemberDto);
  }

  @Put()
  @ApiOperation({ summary: '更新成员' })
  async updateMember(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return await this.membersService.updateMember(+id, updateMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除成员' })
  async delMember(@Param('id') id: string) {
    return await this.membersService.delMember(+id);
  }
}
