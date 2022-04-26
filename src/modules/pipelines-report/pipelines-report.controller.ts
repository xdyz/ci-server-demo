import {
  Controller,
  Get,
  Query,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PipelinesReportService } from './pipelines-report.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('管线报告')
@Controller('pipelines/records/report')
export class PipelinesReportController {
  constructor(
    private readonly pipelinesReportService: PipelinesReportService,
  ) {}

  // 管线的成功率
  // app.get("/records/report/rate", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.pipelineService.getPipelineRecordRate(req.session, req.query);
  //   }
  // });
  @Get('rate')
  async getPipelineRecordRate(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getPipelineRecordRate(user, query);
  }

  // app.get("/records/report/day_rate", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineRecordsRateDay(req.session, req.query);
  //   }
  // });
  @Get('day_rate')
  async getPipelineRecordsRateDay(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getPipelineRecordsRateDay(
      user,
      query,
    );
  }

  // app.get("/records/report/duration", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getTopFiveDuration(req.session, req.query);
  //   }
  // });
  @Get('duration')
  async getTopFiveDuration(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getTopFiveDuration(user, query);
  }

  // app.get("/records/report/task/rate", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipilineRecordsTaskRate(req.session, req.query);
  //   }
  // });
  @Get('task/rate')
  async getPipilineRecordsTaskRate(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getPipilineRecordsTaskRate(
      user,
      query,
    );
  }

  // app.get("/records/report/task/day_rate", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineRecordsTaskRateDay(req.session, req.query);
  //   }
  // });
  @Get('task/day_rate')
  async getPipelineRecordsTaskRateDay(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getPipelineRecordsTaskRateDay(
      user,
      query,
    );
  }

  // app.get("/records/report/task/duration", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getTaskTopFiveDuration(req.session, req.query);
  //   }
  // });
  @Get('task/duration')
  async getTaskTopFiveDuration(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getTaskTopFiveDuration(
      user,
      query,
    );
  }

  // app.get("/records/report/task/pipeline/relation", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getTaskAndPipelineRelation(req.session, req.query);
  //   }
  // });
  @Get('task/pipeline/relation')
  async getTaskAndPipelineRelation(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getTaskAndPipelineRelation(
      user,
      query,
    );
  }

  // app.get("/records/report/statics", {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.pipelineService.getPipelineRunHistory(req.session, req.query);
  //   }
  // });
  @Get('statics')
  async getPipelineRunHistory(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getPipelineRunHistory(user, query);
  }

  // app.get("/records/report/task/statics",{
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return app.services.pipelineService.getTaskInPipelineRecords(req.session, req.query);
  //   }
  // });
  @Get('task/statics')
  async getTaskInPipelineRecords(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.pipelinesReportService.getTaskInPipelineRecords(
      user,
      query,
    );
  }
}
