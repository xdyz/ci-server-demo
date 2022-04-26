import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ResourceInstancesService } from './instances.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('检查实例')
@Controller('instances')
export class ResourceInstancesController {
  constructor(
    private readonly resourceInstancesService: ResourceInstancesService,
  ) {}

  // const { resourceService } = app.services
  //  app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.getResourceInstances(req.session, req.query);
  //   }
  // });
  @Get()
  async getResourceInstances(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstancesService.getResourceInstances(
      user,
      query,
    );
  }

  // app.get('/all', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.getAllResourceInstances(req.session);
  //   }
  // });
  @Get('all')
  async getAllResourceInstances(
    @Request() req: any,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstancesService.getAllResourceInstances(user);
  }

  // app.get('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.getOneResourceInstance(req.params);
  //   }
  // });
  @Get(':id')
  async getOneResourceInstance(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstancesService.getOneResourceInstance(+id);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.insertReourceInstances(req.session, req.body);
  //   }
  // });
  @Post()
  async insertResourceInstances(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstancesService.insertResourceInstances(
      user,
      body,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.updateReourceInstances(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  async updateResourceInstances(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstancesService.updateResourceInstances(
      +id,
      body,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.deleteReourceInstances(req.params.id);
  //   }
  // });
  @Delete(':id')
  async deleteResourceInstances(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceInstancesService.deleteResourceInstances(+id);
  }
}
