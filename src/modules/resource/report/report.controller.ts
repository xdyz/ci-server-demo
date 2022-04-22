import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Headers,
  Query,
} from '@nestjs/common';
import { ResourceReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('report')
export class ResourceReportController {
  constructor(private readonly resourceReportService: ResourceReportService) {}

  // 检查结果
  // app.get('/check/report/result', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.taskService.getCheckReportResult(req.session, req.query);
  //   }
  // });
  @Get('result')
  async getCheckReportResult(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceReportService.getCheckReportResult(user, query);
  }

  // 通过率
  // app.get('/check/report/rate', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.taskService.getCheckReportRate(req.session, req.query);
  //   }
  // });
  @Get('rate')
  async getCheckReportRate(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceReportService.getCheckReportRate(user, query);
  }

  // 严重和警告的个数
  // 通过率
  // app.get('/check/report/item/rate', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const { project_id } = req.session;
  //     return await app.services.taskService.getCheckReportItemRate({ project_id, ...req.query });
  //   }
  // });
  @Get('item/rate')
  async getCheckReportItemRate(
    // @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceReportService.getCheckReportItemRate({
      project_id,
      ...query,
    });
  }

  // app.get('/check/report/item/rate/noauth', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const query = await app.utils.parseTimeToSeconds(req.query);
  //     return await app.services.taskService.getCheckReportItemRate(query);
  //   }
  // });
  @Get('item/rate/noauth')
  async getCheckReportItemRateNoAuth(@Query() query: any) {
    return await this.resourceReportService.getCheckReportItemRate(query);
  }

  // 展示每个分类的最新的一条数据
  // app.get('/check/report/category/last_build', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.taskService.getDifferentCategoryLastBuild(req.session);
  //   }
  // });
  @Get('category/last_build')
  async getDifferentCategoryLastBuild(
    @Request() req: any,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceReportService.getDifferentCategoryLastBuild(user);
  }
}
