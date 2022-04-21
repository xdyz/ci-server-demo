import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  Request,
} from '@nestjs/common';
import { PipelinesListService } from './pipeline-list.service';

@Controller()
export class PipelinesListController {
  constructor(private readonly pipelinesListService: PipelinesListService) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineList(req.session, req.query);
  //   }
  // });
  @Get()
  async getPipelineList(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesListService.getPipelineList(user, query);
  }

  // app.get('/detail/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getOnePipeline(req.params.id);
  //   }
  // });
  @Get('detail/:id')
  async getOnePipeline(
    @Param('id') id: string,
    // @Headers('project_id') project_id: string,
  ) {
    // const user = { project_id: +project_id };
    return await this.pipelinesListService.getOnePipeline(+id);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.insertPipeline(req.session, req.body);
  //   }
  // });
  @Post()
  async insertPipeline(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    const user = { ...body.user, project_id: +project_id };
    return await this.pipelinesListService.insertPipeline(user, body);
  }

  // app.post('/execute/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const user_id = req.session.user_id;
  //     return await app.services.pipelineService.execute(req.params.id, user_id);
  //   }
  // });
  @Post('execute/:id')
  async execute(@Param('id') id: string, @Request() req: any) {
    const { user_id } = req.user;
    return await this.pipelinesListService.execute(+id, user_id);
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.updatePipeline(req.params.id, req.body);
  //   }
  // });
  @Patch('/:id')
  async updatePipeline(@Param('id') id: string, @Body() body: any) {
    return await this.pipelinesListService.updatePipeline(+id, body);
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.deletePipeline(req.params.id);
  //   }
  // });
  @Delete('/:id')
  async deletePipeline(@Param('id') id: string) {
    return await this.pipelinesListService.deletePipeline(+id);
  }

  // app.get('/parameters', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getParameters(req.query);
  //   }
  // });
  @Get('parameters')
  async getParameters(@Query() query: any) {
    return await this.pipelinesListService.getParameters(query);
  }

  // app.put('/config/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.updatePipelineConfig(req.params.id, req.body);
  //   }
  // });
  @Patch('config/:id')
  async updatePipelineConfig(@Param('id') id: string, @Body() body: any) {
    return await this.pipelinesListService.updatePipelineConfig(+id, body);
  }

  // 复制
  // app.post('/copy/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.copyOnePipeline(req.session, req.params.id);
  //   }
  // });
  @Post('copy/:id')
  async copyOnePipeline(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesListService.copyOnePipeline(user, +id);
  }

  @Get('/relationship/include/:id')
  async getRelationShipInclude(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesListService.getRelationShipInclude(user, {
      id: +id,
    });
  }

  @Post('/webhook/:id')
  async executeWebhook(
    @Param('id') id: string,
    @Query('user_id') user_id: string,
  ) {
    return await this.pipelinesListService.execute(+id, +user_id);
  }
}
