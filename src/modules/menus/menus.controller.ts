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
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';
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
  async updateMenu(@Param('id') id: number, @Body() updateMenuDto: any) {
    return await this.menusService.updateMenu(id, updateMenuDto);
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.menuService.delMenu(req.params.id);
  //   }
  // });
  @Delete(':id')
  async delMenu(@Param('id') id: number) {
    return await this.menusService.delMenu(id);
  }
}
