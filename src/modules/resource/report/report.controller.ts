import {
  Controller,
  Get,
  Request,
  Headers,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResourceReportService } from './report.service';
import { CreateReportDto, UpdateReportDto } from './dtos/index.dto';
import {} from './dtos/update-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('资源检查报告')
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
  @ApiOperation({ summary: '获取检查结果' })
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
  @ApiOperation({ summary: '获取检查结果通过率' })
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
  @ApiOperation({ summary: '获取严重和警告个数' })
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
  @ApiOperation({ summary: '对外的结果' })
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
  @ApiOperation({ summary: '获取分类最新一次的构建' })
  async getDifferentCategoryLastBuild(
    @Request() req: any,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceReportService.getDifferentCategoryLastBuild(user);
  }
}
