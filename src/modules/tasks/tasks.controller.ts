import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Request,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dtos/index.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('用户')
@ApiBearerAuth('jwt') // s
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // app.get('/:task_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await taskService.getTask(req.params.task_id);
  //   }
  // });
  @Get(':id')
  @ApiOperation({ summary: '获取单个任务' })
  async getTask(@Param('id') id: number) {
    return await this.tasksService.getTask(id);
  }

  // app.put('/:task_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const result = await taskService.updateTask(req.params.task_id, req.body);
  //     await viewService.initialize();
  //     return result;
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新单个任务' })
  async updateTask(@Param('id') id: number, @Body() updateTaskDto: any) {
    return await this.tasksService.updateTask(id, updateTaskDto);
  }

  // app.delete('/:task_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const result = taskService.deleteTask(req.params.task_id);
  //     await viewService.initialize();
  //     return result;
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除任务' })
  async deleteTask(@Param('id') id: number) {
    return await this.tasksService.deleteTask(id);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const result = await taskService.createTask(req.session, req.body);
  //     await viewService.initialize();
  //     return result;
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '创建任务' })
  async createTask(
    @Headers('project_id') project_id: string,
    @Body() createTaskDto: any,
  ) {
    return await this.tasksService.createTask(
      { project_id: +project_id },
      createTaskDto,
    );
  }

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.taskService.getAllTasks(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取所有的任务' })
  async getAllTasks(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.tasksService.getAllTasks(user, query);
  }
}
