import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { TasksEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';

@Injectable()
export class TasksService implements OnModuleInit {
  sentryClient: any;
  constructor(@InjectSentry() private readonly sentryService: SentryService) {
    this.sentryClient = sentryService.instance();
  }
  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

  taskExtraMap = {};
  taskMap = {};

  async onModuleInit() {
    await this.initializeTasks();
  }

  async initializeTask(task) {
    this.taskMap[task.id] = task;
    const taskExtra = {
      // parameters: [], //构建参数
      executingBuilds: [], //执行构建的结果
      // eventListenersMap: {}, //事件侦听列表
      // crons: [], //时间触发列表
      last_build: null, // 最近构建数据 运用任务列表的 最近构建耗时
      // views: [], //任务类型视图 任务列表左边的大类任务视图数据，记录该大类任务的数量 executing_build_count 发布更新事件
      // error: false, //标记任务脚本是否有错误（无法正常运行）
    };
    this.taskExtraMap[task.id] = taskExtra;

    task.enabled = !!task.enabled;

    // task.last_build = await this.getLastBuild(task.id); //最近构建
  }

  async initializeTasks() {
    // if (!app?.taskMap) {
    //   app.decorate('taskMap', {
    //     getter() {
    //       return taskMap;
    //     }
    //   });
    //   app.decorate('taskExtraMap', {
    //     getter() {
    //       return taskExtraMap;
    //     }
    //   });
    // }
    // taskMap = {}; // 任务
    // taskExtraMap = {}; //执行构建的方法
    // executingBuildMap = {};//构建结果 build 数据
    // executingBuildExtraMap = {}; //构建构成的错误日志，构建阶段信息
    // const [tasks] = await app.mysql.query(tasksConstants.SELECT_TASKS_NO_CONDITION, []);
    const tasks = await this.tasksRepository.find();
    for (const task of tasks) {
      await this.initializeTask(task);
    }
    // scheduler.scheduleJob('*/1 * * * *', function () {
    //   app.utils.log.upFloder();
    // });
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
      delete this.taskMap[id];
      delete this.taskExtraMap[id];
      return;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
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
    const tasks = await this.tasksRepository.find({
      where: {
        project_id,
        ...params,
      },
    });

    return tasks;
  }
}
