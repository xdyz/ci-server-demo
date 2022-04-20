import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  Request,
  Headers,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dtos/create-member.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
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
  async getProjectAdmin(@Param('id') id) {
    return await this.membersService.getProjectAdmin(+id);
  }

  @Post()
  async insertMember(@Body() createMemberDto: CreateMemberDto) {
    return await this.membersService.insertMember(createMemberDto);
  }

  @Put()
  async updateMember(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return await this.membersService.updateMember(+id, updateMemberDto);
  }

  @Delete(':id')
  async delMember(@Param('id') id: string) {
    return await this.membersService.delMember(+id);
  }
}
