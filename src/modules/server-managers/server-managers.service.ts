import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateServerManagerDto } from './dtos/create-server-manager.dto';
import { UpdateServerManagerDto } from './dtos/update-server-manager.dto';
import * as utils from 'src/utils/index.utils';
@Injectable()
export class ServerManagersService {
  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

  caculatePassCount = (selBuilds) => {
    if (selBuilds.length === 0) return 0;

    const result = selBuilds.reduce((cur, next) => {
      const val = next.status === 2 ? 1 : 0;
      return (cur += val);
    }, 0);

    return result;
  };
  caculateFailCount = (selBuilds) => {
    if (selBuilds.length === 0) return 0;

    const result = selBuilds.reduce((cur, next) => {
      const val = next.status > 2 ? 1 : 0;
      return (cur += val);
    }, 0);

    return result;
  };

  caculateResult = (selBuilds) => {
    const result = {
      total: 0,
      pass_count: 0,
      fail_count: 0,
    };

    if (selBuilds.length === 0) return result;

    result.total = selBuilds.length;
    result.pass_count = this.caculatePassCount(selBuilds);
    result.fail_count = this.caculateFailCount(selBuilds);

    return result;
  };

  async getServerTaskFrequency({ project_id, from, to }) {
    // const [builds] = await app.mysql.query(serverManagerConstants.SELECT_SERVER_BUILD_NO_CONDITION, [SERVER, project_id, 1, from, to]);
    const builds = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.type = :type', { type: utils.buildTypes.SERVER })
      .andWhere('b.project_id = :project_id', { project_id })
      .andWhere('b.status >= :status', { status: 1 })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();
    const result = await this.caculateResult(builds);

    return {
      data: result,
    };
  }

  getDayCategoryRate = async (curDayData, categries, day) => {
    const result = await Promise.all(
      categries.map(async (item) => {
        // 找出这个分类 在今天的数据量
        const cateData = curDayData.filter(
          (build) => build.job_name === item.name,
        );
        const total = cateData.length;
        const pass_count = this.caculatePassCount(cateData);
        const rate = total
          ? Number(((pass_count / total) * 100).toFixed(2))
          : 0;

        return {
          name: item.display_name,
          day,
          value: rate,
        };
      }),
    );

    return result;
  };

  differentTaskRate = async (from, to, selBuilds, project_id) => {
    const oneDaySeconds = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySeconds - 1;
    let data = [];
    // 获取自动化测试分类
    // const categries = await app.services.taskService.getAllTasksByTags(SERVER, project_id);
    const categries = await this.tasksRepository.find({
      where: {
        project_id,
        build_type: utils.buildTypes.SERVER,
      },
    });

    while (curDay >= from && curDay <= to) {
      // 过滤出今天的数据
      const curDayData = selBuilds.filter(
        (item) => item.time >= curDay && item.time <= endCurDay,
      );
      // 根据分类的数据，处理出各个分类在今天的通过率
      const arr = await this.getDayCategoryRate(curDayData, categries, curDay);

      data = [...data, ...arr];
      // curDay = moment(curDay).add(1, 'd').format('YYYY-MM-DD');
      curDay += oneDaySeconds;
      endCurDay = curDay + oneDaySeconds - 1;
    }

    return data;
  };

  async getServerTaskRate({ project_id }, { from, to }) {
    // const [builds] = await app.mysql.query(serverManagerConstants.SELECT_SERVER_BUILD_NO_CONDITION, [SERVER, project_id, 1, from, to]);
    const builds = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.type = :type', { type: utils.buildTypes.SERVER })
      .andWhere('b.project_id = :project_id', { project_id })
      .andWhere('b.status >= :status', { status: 1 })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();
    const result = await this.differentTaskRate(from, to, builds, project_id);
    return {
      data: result,
    };
  }

  accumulateDuration = (selBuilds) => {
    if (selBuilds.length === 0) return 0;
    const result = selBuilds.reduce((cur, next) => {
      const duration = next.duration ? next.duration : 0;
      return (cur += duration);
    }, 0);

    return result;
  };

  getDayCategoryDuration = async (curDayData, categries, day) => {
    const result = await Promise.all(
      categries.map(async (item) => {
        // 找出这个分类 在今天的数据量
        const cateData = curDayData.filter(
          (build) => build.job_name === item.name,
        );
        const total = cateData.length;
        const duration = this.accumulateDuration(cateData);
        const average_duration = total
          ? Number((duration / (total * 60)).toFixed(2))
          : 0;

        return {
          name: item.display_name,
          day,
          value: average_duration,
        };
      }),
    );

    return result;
  };

  differentTaskDuration = async (from, to, selBuilds, project_id) => {
    const oneDaySeconds = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySeconds - 1;
    let data = [];
    // 获取自动化测试分类
    // const categries = await app.services.taskService.getAllTasksByTags(SERVER, project_id);
    const categries = await this.tasksRepository.find({
      where: {
        project_id,
        build_type: utils.buildTypes.SERVER,
      },
    });

    while (curDay >= from && curDay <= to) {
      // 过滤出今天的数据
      const curDayData = selBuilds.filter(
        (item) => item.time >= curDay && item.time <= endCurDay,
      );
      // 根据分类的数据，处理出各个分类在今天的通过率
      const arr = await this.getDayCategoryDuration(
        curDayData,
        categries,
        curDay,
      );

      data = [...data, ...arr];
      // curDay = moment(curDay).add(1, 'd').format('YYYY-MM-DD');
      curDay += oneDaySeconds;
      endCurDay = curDay + oneDaySeconds - 1;
    }

    return data;
  };

  async getServerTaskDuration({ project_id }, { from, to }) {
    // const [builds] = await app.mysql.query(serverManagerConstants.SELECT_SERVER_BUILD_NO_CONDITION, [SERVER, project_id, 1, from, to]);
    const builds = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.type = :type', { type: utils.buildTypes.SERVER })
      .andWhere('b.project_id = :project_id', { project_id })
      .andWhere('b.status >= :status', { status: 1 })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();

    const result = await this.differentTaskDuration(
      from,
      to,
      builds,
      project_id,
    );
    return result;
  }

  dealWithCategoryLatest = async (selBuilds, project_id) => {
    const result = await Promise.all(
      selBuilds.map(async (item) => {
        // const task = await app.services.taskService.getAllTasksByTagsAndName(item.job_name, SERVER, project_id);
        const task = await this.tasksRepository.findOne({
          where: {
            project_id,
            build_type: utils.buildTypes.SERVER,
            name: item.job_name,
          },
        });
        return {
          ...item,
          // id: item.id,
          task_id: task?.id,
          name: task?.display_name,
          // job_name: item.job_name,
          // duration: item.duration,
          // created_at: item.created_at,
        };
      }),
    );

    const data = result.filter((res) => res.task_id !== undefined);
    return data;
  };

  async getCategoryLatestBuild({ project_id }) {
    // const [builds] = await app.mysql.query(serverManagerConstants.SELECT_SERVER_BUILD_LAST_DIFFERENT_TASK_SUCCESS, [SERVER, project_id, 1]);
    const builds = await this.buildsRepository
      .createQueryBuilder('b')
      .select(['b.id', 'b.job_name', 'b.custom_data'])
      .addSelect('UNIX_TIMESTAMP(b.created_at) as created_at')
      .from((qb) => {
        const subQuery = qb
          .subQuery()
          .select(
            'ROW_NUMBER() OVER (PARTITION BY job_name ORDER BY created_at DESC) AS rn, u.* ',
          )
          .from('builds', 'u')
          .where('build_type = :build_type', {
            build_type: utils.buildTypes.SERVER,
          })
          .andWhere('project_id = :project_id', { project_id });
        return subQuery;
      }, 't')
      .where('t.rn = :rn', { rn: 1 })
      .getMany();
    const result = await this.dealWithCategoryLatest(builds, project_id);
    return result;
  }
}
