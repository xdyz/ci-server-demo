import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Request,
  Headers,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ViewsService } from './views.service';
import { CreateViewDto } from './dtos/create-view.dto';
import { UpdateViewDto } from './dtos/update-view.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('视图')
@ApiBearerAuth('jwt') // s
@Controller('views')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  // app.get('/:view_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     // const { data: currentUser } = await app.services.userService.getUser(req.session.user_id);
  //     return await app.services.viewService.getView(req.params.view_id);
  //   }
  // });
  @Get(':id')
  @ApiOperation({ summary: '获取单个视图' })
  async getView(@Param('id') id: string) {
    return await this.viewsService.getView(+id);
  }

  // app.get('/:view_id/tasks', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.viewService.getViewTasks(req.session, req.params, req.query);
  //   }
  // });
  @Get(':id/tasks')
  @ApiOperation({ summary: '获取单个视图下所有的任务' })
  async getViewTasks(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.viewsService.getViewTasks(user, { view_id: id }, query);
  }

  // app.put('/:view_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.viewService.updateView(req.params.view_id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新单个视图' })
  async updateView(@Param('id') id: string, @Body() updateViewDto: any) {
    return await this.viewsService.updateView(+id, updateViewDto);
  }

  // app.delete('/:view_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const { data: currentUser } = await app.services.userService.getUser(req.session.user_id);
  //     return await app.services.viewService.deleteView(req.params.view_id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除单个视图' })
  async deleteView(@Param('id') id: string) {
    return await this.viewsService.deleteView(+id);
  }

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.viewService.getViews(req.session);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取所有视图' })
  async getViews(@Request() req, @Headers('project_id') project_id: string) {
    const user = { ...req.user, project_id: +project_id };
    return await this.viewsService.getViews(user);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.viewService.createView(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建单个视图' })
  async createView(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createViewDto: CreateViewDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.viewsService.createView(user, createViewDto);
  }

  // app.put('/icons/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.viewService.uploadIcon(req.params.id, req.body);
  //   }
  // });
  @Put('icons/:id')
  @ApiOperation({ summary: '更新单个视图图标' })
  async uploadIcon(@Param('id') id: string, @Body() body: any) {
    return await this.viewsService.uploadIcon(+id, body);
  }
}
