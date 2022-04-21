import { Controller, Get, Query, Headers, Request } from '@nestjs/common';
import { PipelinesRecordsReportService } from './report.service';

@Controller('records/report')
export class PipelinesRecordsReportController {
  constructor(
    private readonly pipelinesRecordsReportService: PipelinesRecordsReportService,
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
    return await this.pipelinesRecordsReportService.getPipelineRecordRate(
      user,
      query,
    );
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
    return await this.pipelinesRecordsReportService.getPipelineRecordsRateDay(
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
    return await this.pipelinesRecordsReportService.getTopFiveDuration(
      user,
      query,
    );
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
    return await this.pipelinesRecordsReportService.getPipilineRecordsTaskRate(
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
    return await this.pipelinesRecordsReportService.getPipelineRecordsTaskRateDay(
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
    return await this.pipelinesRecordsReportService.getTaskTopFiveDuration(
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
    return await this.pipelinesRecordsReportService.getTaskAndPipelineRelation(
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
    return await this.pipelinesRecordsReportService.getPipelineRunHistory(
      user,
      query,
    );
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
    return await this.pipelinesRecordsReportService.getTaskInPipelineRecords(
      user,
      query,
    );
  }
}
