import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetRoleDto } from './dtos/get-role.dto';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('角色')
@ApiBearerAuth('jwt') // s
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取单个角色' })
  async getRole(@Param('id') id: string) {
    return await this.rolesService.getRole(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: any) {
    return await this.rolesService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  async deleteRole(@Param('id') id: string) {
    return await this.rolesService.deleteRole(+id);
  }

  @Post()
  @ApiOperation({ summary: '新建角色' })
  async createRole(@Body() createRoleDto: any) {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取分页角色' })
  async getRoles(@Query() getRolesDto: GetRoleDto) {
    return await this.rolesService.getRoles(getRolesDto);
  }

  @Get('/all')
  @ApiOperation({ summary: '获取所有角色' })
  async getAllRoles(@Query() getAllRolesDto: any) {
    return await this.rolesService.getAllRoles(getAllRolesDto);
  }
}
