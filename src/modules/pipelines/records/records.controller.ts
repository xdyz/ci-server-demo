import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Request,
  Headers,
} from '@nestjs/common';
import { PipelinesRecordsService } from './records.service';

@Controller('records')
export class PipelinesRecordsController {
  constructor(
    private readonly pipelinesRecordsService: PipelinesRecordsService,
  ) {}
  // app.get('/records/list', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineRecordsList(req.session, req.query);
  //   }
  // });
  @Get('list')
  async getPipelineRecordsList(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesRecordsService.getPipelineRecordsList(
      user,
      query,
    );
  }

  // app.get('/records/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getOnePipelineRecordInfo(req.params.id);
  //   }
  // });
  @Get('/:id')
  async getOnePipelineRecordInfo(
    @Param('id') id: string,
    // @Headers('project_id') project_id: string,
  ) {
    // const user = { project_id: +project_id };
    return await this.pipelinesRecordsService.getOnePipelineRecordInfo(+id);
  }

  // app.post('/records', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.insertPipelineRecord(req.session, req.body);
  //   }
  // });
  @Post()
  async insertPipelineRecord(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesRecordsService.insertPipelineRecord(user, body);
  }

  // app.put('/records/:id/restart', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.restartPipelineRecord(req.session, req.params.id);
  //   }
  // });
  @Put('/:id/restart')
  async restartPipelineRecord(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesRecordsService.restartPipelineRecord(user, +id);
  }

  // app.get('/records/history', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineRecordByPipelineIdAndTime(req.query);
  //   }
  // });
  @Get('/history')
  async getPipelineRecordByPipelineIdAndTime(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesRecordsService.getPipelineRecordByPipelineIdAndTime(
      query,
    );
  }
}
