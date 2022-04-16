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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('用户')
@ApiBearerAuth('jwt') // swagger 开启 jwt 验证
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.usersService.getUser(+id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() user: any) {
    return await this.usersService.updateUser(+id, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(+id);
  }

  @Post()
  async createUser(@Body() user: any) {
    return await this.usersService.createUser(user);
  }

  @Get()
  async getUsers(@Body() user: any) {
    return await this.usersService.getUsers(user);
  }

  @Get('all')
  async getAllUsers(@Body() user: any) {
    return await this.usersService.getAllUsers(user);
  }
}
