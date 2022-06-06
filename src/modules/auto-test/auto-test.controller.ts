import {
  Controller,
  Get,
  Body,
  Param,
  Headers,
  Request,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { CreateAutoTestDto } from './dtos/create-auto-test.dto';
import { UpdateAutoTestDto } from './dtos/update-auto-test.dto';
import * as utils from 'src/utils/index.utils';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('检查分类')
@Controller('auto_test')
export class AutoTestController {
  constructor(private readonly autoTestService: AutoTestService) {}

  //   app.get('/report/result', {
  //     preHandler: app.verifyAuthorization,
  //     handler: async (req) => {
  //       const { project_id } = req.session;
  //       return await app.services.autoTestService.getReportResult({ project_id, ...req.query });
  //     }
  // });
  @Get('report/result')
  @ApiOperation({ summary: '获取自动化测试结果 内部接口' })
  async getReportResult(
    @Body() body: any,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...body.user, project_id: +project_id };
    return await this.autoTestService.getReportResult({ user, ...body });
  }

  // app.get('/report/result/noauth', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const query = await app.utils.parseTimeToSeconds(req.query);
  //     return await app.services.autoTestService.getReportResult(query);
  //   }
  // });
  @Get('report/result/noauth')
  @ApiOperation({ summary: '获取自动化测试数据 对外接口' })
  async getReportResultNoAuth(@Body() body: any) {
    const query = await utils.parseTimeToSeconds(body);
    return await this.autoTestService.getReportResult(query as any);
  }

  // app.get('/report/fail_case/trend', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.autoTestService.getFailCaseTrend(req.session, req.query);
  //   }
  // });
  @Get('report/fail_case/trend')
  @ApiOperation({ summary: '获取自动化测试失败总数' })
  async getFailCaseTrend(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.autoTestService.getFailCaseTrend(user, query);
  }

  // app.get('/report/total_case/trend', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.autoTestService.getTotalCaseTrend(req.session, req.query);
  //   }
  // });
  @Get('report/total_case/trend')
  async getTotalCaseTrend(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.autoTestService.getTotalCaseTrend(user, query);
  }

  // app.get('/report/latest/build', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.autoTestService.getCategoryLatestBuild(req.session);
  //   }
  // });
  @Get('report/latest/build')
  @ApiOperation({ summary: '获取自动化测试最后的构建' })
  async getCategoryLatestBuild(
    @Request() req: any,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.autoTestService.getCategoryLatestBuild(user);
  }

  // app.get('/report/top/fail_types', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.autoTestService.getTopFailTypes(req.session);
  //   }
  // });
  @Get('report/top/fail_types')
  @ApiOperation({ summary: '获取自动化测试失败类型' })
  async getTopFailTypes(
    @Request() req: any,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.autoTestService.getTopFailTypes(user);
  }

  // app.get('/report/build_rate', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.autoTestService.getReportBuildRate(req.session, req.query);
  //   }
  // });
  @Get('report/build_rate')
  @ApiOperation({ summary: '获取自动化测试通过率' })
  async getReportBuildRate(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.autoTestService.getReportBuildRate(user, query);
  }

  // app.put('/update/suits/:build_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.autoTestService.updateResultSuits(req.params.build_id, req.body);
  //   }
  // });
  @Put('update/suits/:build_id')
  async updateResultSuits(
    @Param('build_id') build_id: string,
    // @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    // const user = { ...body.user, project_id: +project_id };
    return await this.autoTestService.updateResultSuits(+build_id, body);
  }
}
