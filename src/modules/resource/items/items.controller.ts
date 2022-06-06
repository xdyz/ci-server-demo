import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ResourceInstanceItemsService } from './items.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('检查实例内的检查项')
@Controller('/instances/:intance_id/items')
export class ResourceInstanceItemsController {
  constructor(
    private readonly resourceInstanceItemsService: ResourceInstanceItemsService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.getResourceInstanceItems(req.session, req.params, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取实例检查项' })
  async getResourceInstanceItems(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstanceItemsService.getResourceInstanceItems(
      user,
      query,
    );
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.insertReourceInstanceItems(req.session, req.params, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '创建实例检查项' })
  async insertResourceInstanceItems(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Param() params: any,
    @Body() body: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstanceItemsService.insertResourceInstanceItems(
      user,
      params,
      body,
    );
  }

  // app.put('/:item_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.updateReourceInstanceItems(req.params, req.body);
  //   }
  // });
  @Put(':item_id')
  @ApiOperation({ summary: '更显实例检查项' })
  async updateResourceInstanceItems(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param() params: any,
    @Body() body: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstanceItemsService.updateResourceInstanceItems(
      params,
      body,
    );
  }

  // app.delete('/:item_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.deleteReourceInstanceItems(req.params);
  //   }
  // });
  @Delete(':item_id')
  @ApiOperation({ summary: '删除实例检查项' })
  async deleteResourceInstanceItems(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param() params: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstanceItemsService.deleteResourceInstanceItems(
      params,
    );
  }

  // app.post('/:item_id/copy', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.resourceService.copyReourceInstanceItems(req.params);
  //   }
  // });
  @Post(':item_id/copy')
  @ApiOperation({ summary: '复制实例检查项' })
  async copyResourceInstanceItems(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param() params: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstanceItemsService.copyResourceInstanceItems(
      params,
    );
  }
}
