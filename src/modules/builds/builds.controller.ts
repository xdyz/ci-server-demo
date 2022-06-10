import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BuildsService } from './builds.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('构建记录')
@Controller('tasks/:task_id/builds')
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  // app.get('/:build_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await taskService.getBuild(req.params.task_id, req.params.build_id);
  //   }
  // });
  @Get(':id')
  @ApiOperation({ summary: '获取单个构建记录' })
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
  @ApiOperation({ summary: '获取构建记录' })
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
  @ApiOperation({ summary: '创建构建记录' })
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
  @ApiOperation({ summary: '分页获取构建记录' })
  async getTaskBuilds(@Param('task_id') task_id: string, @Query() query: any) {
    return await this.buildsService.getTaskBuilds(+task_id, query);
  }
}
