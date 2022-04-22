import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

  taskExtraMap = {};
  taskMap = {};

  async onModuleInit() {
    // await initializeTaskMap();
  }

  dealWithQuery(params = {}) {
    const result = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val) {
        result[key] = Like(`%${val}%`);
      }
    });

    return result;
  }

  async getTask(id) {
    const task = await this.tasksRepository.findOne(id);
    return task;
  }

  async updateTask(id: number, updateTaskDto) {
    const task = await this.getTask(id);
    if (!task) {
      throw new HttpException('找不到该任务！', HttpStatus.NOT_FOUND);
    }

    try {
      await this.tasksRepository.save({ ...updateTaskDto, id });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Object.assign(task, updateTaskDto);
    // ResetTaskExtra(task.id);

    return task;
  }

  async deleteTask(id) {
    // await app.mysql.query(tasksConstants.DELETE_TASK_BY_ID, [taskId]);
    try {
      await this.tasksRepository.delete({ id });
      // delete taskMap[taskId];
      // delete taskExtraMap[taskId];
      return;
    } catch (error) {
      // app.sentry.captureException(error);
      // throw new Error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // { name, display_name, enabled, view_name, view_id, document_url, description, jenkins_id }
  async createTask({ project_id }, createTaskDto) {
    try {
      const task = await this.tasksRepository.create({
        ...createTaskDto,
        project_id,
      });
      const data = await this.tasksRepository.save(task);
      // await initializeTask(task);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 根据tags 来获取该tags 的任务
  async getAllTasksByTags(view_name, project_id) {
    // const [tasks] = await app.mysql.query(tasksConstants.SELECT_TASKS_BY_VIEW_NAME_AND_PROJECT_ID, [view_name, project_id]);
    const tasks = await this.tasksRepository.find({
      where: {
        view_name,
        project_id,
      },
    });
    return tasks;
  }

  // 根据tags 和 name 来获取该job_name 的任务
  async getAllTasksByTagsAndName(name, view_name, project_id) {
    // const [tasks] = await app.mysql.query(tasksConstants.SELECT_TASK_BY_NAME_AND_VIEW_NAME_AND_PROJECT_ID, [name, view_name, project_id]);
    const task = await this.tasksRepository.findOne({
      where: {
        name,
        view_name,
        project_id,
      },
    });
    // const task = tasks[0];
    return task;
  }

  // 获取所有的tasks 或者根据条件进行筛选的
  async getAllTasks({ project_id }, queries = {}) {
    const params = this.dealWithQuery(queries);
    // const whereSql = queryKeys.length !== 0 ? `AND ${queryKeys.join(' AND ')}` : '';
    // const [tasks] = await app.mysql.query(
    //   `${tasksConstants.SELECT_TASKS_BY_PROJECT_ID} ${whereSql}
    //     `, [project_id, ...queryValues]);
    const tasks = await this.tasksRepository.find({
      where: {
        project_id,
        ...params,
      },
    });

    return tasks;
  }
}
