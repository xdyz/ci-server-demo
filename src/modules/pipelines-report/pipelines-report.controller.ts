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
  @ApiOperation({ summary: '管线执行通过率' })
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
  @ApiOperation({ summary: '管线日通过率' })
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
  @ApiOperation({ summary: '管线耗时' })
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
  @ApiOperation({ summary: '管线任务通过率' })
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
  @ApiOperation({ summary: '管线内部任务日通过率' })
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
  @ApiOperation({ summary: '管线任务耗时' })
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
  @ApiOperation({ summary: '管线关系图' })
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
  @ApiOperation({ summary: '管线结果统计' })
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
  @ApiOperation({ summary: '管线内部任务结果统计' })
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
