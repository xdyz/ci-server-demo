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
} from '@nestjs/common';
import { ResourceInstanceItemsService } from './items.service';

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
