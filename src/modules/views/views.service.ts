import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksEntity, ViewsEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { TasksService } from '../tasks/list/tasks.service';
import { CreateViewDto } from './dtos/create-view.dto';
import { UpdateViewDto } from './dtos/update-view.dto';

@Injectable()
export class ViewsService {
  constructor(private tasksService: TasksService) {}

  @InjectRepository(ViewsEntity)
  private readonly viewsRepository: Repository<ViewsEntity>;

  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;
  // viewMap = {};
  // viewExtraMap = {};

  // initializeView(view) {
  //   viewMap[view.id] = view;
  //   const viewExtra = {
  //     tasks: []
  //   };
  //   viewExtraMap[view.id] = viewExtra;
  //   view.executing_build_count = 0;
  //   for (const taskId in app.taskMap) {
  //     const task = app.taskMap[taskId];
  //     if (task.view_id === view.id) {
  //       viewExtra.tasks.push(task);
  //       const taskExtra = app.taskExtraMap[taskId];
  //       taskExtra.views.push(view);
  //       view.executing_build_count += taskExtra.executingBuilds.length;
  //     }
  //   }

  //   viewExtra.tasks.sort((a, b) => b.id - a.id);
  // }

  // async initialize() {
  //   if (!app.viewMap) {
  //     app.decorate('viewMap', {
  //       getter() {
  //         return viewMap;
  //       }
  //     });
  //   }
  //   for (const taskId in app.taskMap) {
  //     const taskExtra = app.taskExtraMap[taskId];
  //     taskExtra.views = [];
  //   }
  //   viewMap = {};
  //   viewExtraMap = {};
  //   // const [views] = await app.mysql.query(app.sqlConstants.viewsConstants.SELECT_VIEWS_NO_CONDITION, []);
  //   const views = await this.viewsRepository.find()
  //   for (const view of views) {
  //     initializeView(view);
  //   }
  // };

  async getView(viewId) {
    const view = await this.viewsRepository.findOne({ id: viewId });

    return view;
  }

  async getViewTasks({ project_id }, { view_id }, { page, per_page }) {
    page = parseInt(page) || 1;
    per_page = parseInt(per_page) || 10;

    const [tasks, total] = await this.tasksRepository.findAndCount({
      where: {
        view_id,
        project_id,
      },
      skip: per_page * (page - 1),
      take: per_page,
    });

    tasks.forEach((el) => {
      if (!el['executing_build_count']) {
        el['executing_build_count'] =
          this.tasksService.taskExtraMap[el.id].executingBuilds.length;
      }
    });

    return {
      data: tasks,
      total,
    };
  }

  async getViews({ project_id }) {
    const views = await this.viewsRepository.find({
      where: {
        project_id,
      },
      order: {
        id: 'DESC',
      },
    });

    return views;
  }

  // { name, display_name, icon }
  async updateView(id, updateViewDto) {
    const data = await this.viewsRepository.save({ id, ...updateViewDto });
    // const [views] = await app.mysql.query(app.sqlConstants.viewsConstants.SELECT_VIEWS_BY_ID, [viewId]);
    // view = views[0];
    // initializeView(data);
    // app.ci.emit('updateView', data);
    return data;
  }

  //{ name, display_name }

  async createView({ project_id }, createViewDto) {
    const result = await this.viewsRepository.create({
      project_id,
      ...createViewDto,
    });
    const view = await this.viewsRepository.save(result);
    // initializeView(view);
    // addDataToView(view);
    return {
      data: view,
    };
  }

  async deleteView(viewId) {
    try {
      await this.viewsRepository.delete({ id: viewId });
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async uploadIcon(viewId, { icon }) {
    try {
      // await app.mysql.query(app.sqlConstants.viewsConstants.UPDATE_VIEWS_ICON_BY_ID, [icon, viewId]);
      // const [views] = await app.mysql.query(app.sqlConstants.viewsConstants.SELECT_VIEWS_BY_ID, [viewId]);
      await this.viewsRepository.save({ id: viewId, icon });
      const result = await this.viewsRepository.findOne({ id: viewId });
      // Object.assign(viewMap[viewId], data);
      // view = views[0];
      // initializeView(result);
      // addDataToView(view);
      // app.ci.emit('updateView', result);
      return {
        data: result,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
