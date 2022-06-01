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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetRoleDto } from './dtos/get-role.dto';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('角色')
@ApiBearerAuth('jwt') // s
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':id')
  async getRole(@Param('id') id: string) {
    return await this.rolesService.getRole(+id);
  }

  @Put(':id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: any) {
    return await this.rolesService.updateRole(+id, updateRoleDto);
  }

  @Delete(':id')
  async deleteRole(@Param('id') id: string) {
    return await this.rolesService.deleteRole(+id);
  }

  @Post()
  async createRole(@Body() createRoleDto: any) {
    return await this.rolesService.createRole(createRoleDto);
  }

  @Get()
  async getRoles(@Query() getRolesDto: GetRoleDto) {
    return await this.rolesService.getRoles(getRolesDto);
  }

  @Get('/all')
  async getAllRoles(@Query() getAllRolesDto: any) {
    return await this.rolesService.getAllRoles(getAllRolesDto);
  }
}
