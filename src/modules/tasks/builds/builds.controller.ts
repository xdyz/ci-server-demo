import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import { BuildsService } from './builds.service';

@Controller(':task_id/builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  // app.get('/:build_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await taskService.getBuild(req.params.task_id, req.params.build_id);
  //   }
  // });
  @Get(':id')
  async getBuild(@Param('id') id: string, @Param('task_id') task_id: string) {
    return await this.buildsService.getBuild(+task_id, +id);
  }

  // app.get('/:build_id/page', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await taskService.getBuildPage(req.params.task_id, req.params.build_id);
  //   }
  // });

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await taskService.getBuilds(req.params.task_id, req.query);
  //   }
  // });
  @Get()
  async getBuilds(@Param('task_id') task_id: string, @Query() query: any) {
    return await this.buildsService.getBuilds(+task_id, query);
  }

  // 这里不需要传project_id task缓存中已经有了所以不需要了
  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     try {
  //       const { parameters } = req.body;
  //       const { user_id } = req.session;
  //       return await taskService.createBuild(req.params.task_id, parameters, user_id);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // });
  @Post()
  async createBuild(
    @Request() req,
    @Param('task_id') task_id: string,
    @Body() body: any,
  ) {
    const { user_id } = req.user;
    const { parameters } = body;
    return await this.buildsService.createBuild(+task_id, parameters, user_id);
  }

  // app.get('/list', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await taskService.getTaskBuilds(req.params.task_id, req.query);
  //   }
  // });

  @Get('list')
  async getTaskBuilds(@Param('task_id') task_id: string, @Query() query: any) {
    return await this.buildsService.getTaskBuilds(+task_id, query);
  }
}
