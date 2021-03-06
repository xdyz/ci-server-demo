import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Query,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/index.dto';

@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('管线')
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineList(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取管线分页列表' })
  async getPipelineList(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesService.getPipelineList(user, query);
  }

  // app.get('/detail/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getOnePipeline(req.params.id);
  //   }
  // });
  @Get('detail/:id')
  @ApiOperation({ summary: '获取单个管线信息' })
  async getOnePipeline(
    @Param('id') id: string,
    // @Headers('project_id') project_id: string,
  ) {
    // const user = { project_id: +project_id };
    return await this.pipelinesService.getOnePipeline(+id);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.insertPipeline(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建管线' })
  async insertPipeline(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    const user = { ...body.user, project_id: +project_id };
    return await this.pipelinesService.insertPipeline(user, body);
  }

  // app.post('/execute/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const user_id = req.session.user_id;
  //     return await app.services.pipelineService.execute(req.params.id, user_id);
  //   }
  // });
  @Post('execute/:id')
  @ApiOperation({ summary: '执行管线' })
  async execute(@Param('id') id: string, @Request() req: any) {
    const { user_id } = req.user;
    return await this.pipelinesService.execute(+id, user_id);
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.updatePipeline(req.params.id, req.body);
  //   }
  // });
  @Put('/:id')
  @ApiOperation({ summary: '更新管线' })
  async updatePipeline(@Param('id') id: string, @Body() body: any) {
    return await this.pipelinesService.updatePipeline(+id, body);
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.deletePipeline(req.params.id);
  //   }
  // });
  @Delete('/:id')
  @ApiOperation({ summary: '删除管线' })
  async deletePipeline(@Param('id') id: string) {
    return await this.pipelinesService.deletePipeline(+id);
  }

  // app.get('/parameters', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getParameters(req.query);
  //   }
  // });
  @Get('parameters')
  @ApiOperation({ summary: '获取管线paramters配置' })
  async getParameters(@Query() query: any) {
    return await this.pipelinesService.getParameters(query);
  }

  // app.put('/config/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.updatePipelineConfig(req.params.id, req.body);
  //   }
  // });
  @Put('config/:id')
  @ApiOperation({ summary: '更新管线配置' })
  async updatePipelineConfig(@Param('id') id: string, @Body() body: any) {
    return await this.pipelinesService.updatePipelineConfig(+id, body);
  }

  // 复制
  // app.post('/copy/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.copyOnePipeline(req.session, req.params.id);
  //   }
  // });
  @Post('copy/:id')
  @ApiOperation({ summary: '复制管线' })
  async copyOnePipeline(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesService.copyOnePipeline(user, +id);
  }

  @Get('/relationship/include/:id')
  @ApiOperation({ summary: '获取管线关系图' })
  async getRelationShipInclude(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesService.getRelationShipInclude(user, {
      id: +id,
    });
  }

  @Post('/webhook/:id')
  @ApiOperation({ summary: '外部webhook 执行管线' })
  async executeWebhook(
    @Param('id') id: string,
    @Query('user_id') user_id: string,
  ) {
    return await this.pipelinesService.execute(+id, +user_id);
  }
}
