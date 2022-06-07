import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './dtos/index.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('菜单')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async () => {
  //     return await app.services.menuService.getAllMenus();
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取所有菜单' })
  async getAllMenus() {
    return await this.menusService.getAllMenus();
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.menuService.insertMenu(req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建菜单' })
  async insertMenu(@Body() createMenuDto: CreateMenuDto) {
    return await this.menusService.insertMenu(createMenuDto);
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.menuService.updateMenu(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  async updateMenu(
    @Param('id') id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return await this.menusService.updateMenu(id, updateMenuDto);
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.menuService.delMenu(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  async delMenu(@Param('id') id: number) {
    return await this.menusService.delMenu(id);
  }
}
