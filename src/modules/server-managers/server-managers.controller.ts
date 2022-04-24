import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Request,
} from '@nestjs/common';
import { ServerManagersService } from './server-managers.service';
import { CreateServerManagerDto } from './dtos/create-server-manager.dto';
import { UpdateServerManagerDto } from './dtos/update-server-manager.dto';
import * as utils from 'src/utils/index.utils';

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
  async getCategoryLatestBuild(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.serverManagersService.getCategoryLatestBuild(user);
  }
}
