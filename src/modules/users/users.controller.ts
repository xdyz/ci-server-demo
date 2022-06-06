import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('用户')
@ApiBearerAuth('jwt') // swagger 开启 jwt 验证
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户' })
  async getUser(@Param('id') id: string) {
    return await this.usersService.getUser(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新单个用户' })
  async updateUser(@Param('id') id: string, @Body() user: any) {
    return await this.usersService.updateUser(+id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除单个用户' })
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(+id);
  }

  @Post()
  @ApiOperation({ summary: '新建单个用户' })
  async createUser(@Body() user: any) {
    return await this.usersService.createUser(user);
  }

  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  async getUsers(@Body() user: any) {
    return await this.usersService.getUsers(user);
  }

  @Get('all')
  @ApiOperation({ summary: '获取所有用户' })
  async getAllUsers(@Body() user: any) {
    return await this.usersService.getAllUsers(user);
  }
}
