import {
  Controller,
  Get,
  Body,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ServerManagersService } from './server-managers.service';
import {
  CreateServerManagerDto,
  UpdateServerManagerDto,
} from './dtos/index.dto';
import * as utils from 'src/utils/index.utils';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('自动化测试错误手册')
@ApiBearerAuth('jwt') // s
@Controller('server-managers')
export class ServerManagersController {
  constructor(private readonly serverManagersService: ServerManagersService) {}

  // app.get('/result', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const { project_id } = req.session;
  //     return await app.services.serverManagerService.getServerTaskFrequency({ project_id, ...req.query });
  //   }
  // });
  @Get('result')
  @ApiOperation({ summary: '获取服务器结果' })
  async getServerTaskFrequency(
    @Headers('project_id') project_id: string,
    @Body() getServerManagerDto: any,
  ) {
    // const user = { ...req.user };
    return await this.serverManagersService.getServerTaskFrequency({
      project_id: +project_id,
      ...getServerManagerDto,
    });
  }

  // app.get('/report/result/noauth', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const query = await app.utils.parseTimeToSeconds(req.query);
  //     return await app.services.serverManagerService.getServerTaskFrequency(query);
  //   }
  // });
  @Get('report/result/noauth')
  @ApiOperation({ summary: '对外获取服务器结果' })
  async getServerTaskFrequencyNoAuth(@Body() getServerManagerDto: any) {
    const query = await utils.parseTimeToSeconds(getServerManagerDto);
    return await this.serverManagersService.getServerTaskFrequency({
      ...getServerManagerDto,
      ...query,
    });
  }

  // app.get('/rate', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.serverManagerService.getServerTaskRate(req.session, req.query);
  //   }
  // });
  @Get('rate')
  @ApiOperation({ summary: '获取服务器通过率' })
  async getServerTaskRate(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() getServerManagerDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.serverManagersService.getServerTaskRate(
      user,
      getServerManagerDto,
    );
  }

  // app.get('/average_duration', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.serverManagerService.getServerTaskDuration(req.session, req.query);
  //   }
  // });
  @Get('average_duration')
  @ApiOperation({ summary: '获取服务器平均耗时' })
  async getServerTaskDuration(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() getServerManagerDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.serverManagersService.getServerTaskDuration(
      user,
      getServerManagerDto,
    );
  }

  // app.get('/latest/build', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.serverManagerService.getCategoryLatestBuild(req.session);
  //   }
  // });
  @Get('latest/build')
  @ApiOperation({ summary: '获取每个服务器最后一次构建记录' })
  async getCategoryLatestBuild(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.serverManagersService.getCategoryLatestBuild(user);
  }
}
