import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PipelineRecordsEntity, PipelinesEntity } from 'src/entities';
import { TasksService } from '../../tasks/list/tasks.service';
import { Repository } from 'typeorm';
import { PipelinesListService } from '../pipeline-list/pipeline-list.service';

@Injectable()
export class PipelinesRecordsReportService {
  constructor(
    private readonly pipelinesListService: PipelinesListService,

    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
  ) {}

  @InjectRepository(PipelinesEntity)
  private readonly pipelinesRepository: Repository<PipelinesEntity>;

  @InjectRepository(PipelineRecordsEntity)
  private readonly pipelineRecordsRepository: Repository<PipelineRecordsEntity>;

  async getPipelineRecordRate({ project_id }, { from, to, create_users }) {
    try {
      const hasResoultRecords = await this.pipelineRecordsRepository
        .createQueryBuilder('pr')
        .select(['pr.id', 'pr.status'])
        .where('pr.project_id = :project_id', { project_id })
        .andWhere('pr.status >= :status', { status: 2 })
        .andWhere('pr.created_at >= :from', { from })
        .andWhere('pr.created_at <= :to', { to })
        .andWhere('pr.created_user IN (:...create_users)', { create_users })
        .getMany();

      const total = hasResoultRecords.length;
      const passCount = hasResoultRecords.filter(
        (item) => item.status === 2,
      ).length;
      const failCount = total - passCount;
      const failTFPipelines = await this.pipelinesRepository
        .createQueryBuilder('p')
        .select((qb) => {
          return qb
            .select(['COUNT(*)'])
            .where('pr1.status > :status', { status: 2 })
            .andWhere('p.id = pr1.pipeline_id')
            .andWhere('UNIX_TIMESTAMP(pr1.created_at) >= :from', { from })
            .andWhere('UNIX_TIMESTAMP(pr1.created_at) <= :to', { to })
            .andWhere('pr1.created_user IN (:...create_users)', {
              create_users,
            })
            .from('pipeline_records', 'pr1');
        }, 'failCount')
        .addSelect((qb) => {
          return qb
            .select(['COUNT(*)'])
            .where('pr2.status >= :status', { status: 2 })
            .andWhere('p.id = pr2.pipeline_id')
            .andWhere('UNIX_TIMESTAMP(pr2.created_at) >= :from', { from })
            .andWhere('UNIX_TIMESTAMP(pr2.created_at) <= :to', { to })
            .andWhere('pr2.created_user IN (:...create_users)', {
              create_users,
            })
            .from('pipeline_records', 'pr2');
        }, 'totalCount')
        .where('p.project_id = :project_id', { project_id })
        .orderBy('(failCount / totalCount)', 'DESC')
        .addOrderBy('totalCount', 'DESC')
        .limit(5)
        .getMany();

      const result = failTFPipelines.filter(
        (item) => item['failCount'] !== 0 && item['totalCount'] !== 0,
      );
      return {
        data: {
          total,
          passCount,
          failCount,
          failTFPipelines: result,
        },
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPipelineRecordsRateDay({ project_id }, { from, to, create_users }) {
    const records = await this.pipelineRecordsRepository
      .createQueryBuilder('pr')
      .select(['UNIX_TIMESTAMP(pr.created_at) day', 'pr.status'])
      .where('pr.project_id = :project_id', { project_id })
      .andWhere('pr.created_at >= :from', { from })
      .andWhere('pr.created_at <= :to', { to })
      .andWhere('pr.created_user IN (:...create_users)', { create_users })
      .getRawMany();

    return {
      data: {
        records,
        from,
        to,
      },
    };
  }

  async getTopFiveDuration({ project_id }, { from, to, create_users }) {
    try {
      const result = await this.pipelinesRepository
        .createQueryBuilder('p')
        .select([
          'p.id',
          'AVG(pr.duration) AS duration',
          'COUNT(pr.id) as count',
          'p.name',
          'u.nickname',
        ])
        .where('p.project_id = :project_id', { project_id })
        .leftJoinAndMapMany(
          'p.records',
          'p.records',
          'pr',
          'pr.pipeline_id = p.id AND UNIX_TIMESTAMP(pr.created_at) >= :from AND UNIX_TIMESTAMP(pr.created_at) <= :to AND create_users IN (:create_users)',
          { from, to, create_users },
        )
        .leftJoinAndSelect('users', 'u', 'u.id = p.created_user')
        .groupBy('p.id')
        .orderBy('p.duration', 'DESC')
        .limit(5)
        .getMany();

      const data = result.map((item) => {
        const { nodes, ...rest } = item;
        return {
          ...rest,
          num: nodes && nodes.length !== 0 ? nodes.length - 1 : 0,
        };
      });

      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  dealWithTaskStatistic(records = []) {
    const { totalCount, passCount } = records.reduce(
      (cur, next) => {
        const pass = next.nodes
          ? next.nodes.filter((item) => {
              if (item?.data?.build?.state === 2) {
                return true;
              }
            }).length
          : 0;

        const total = next.nodes
          ? next.nodes.filter((item) => {
              if (item?.data?.build?.state >= 2) {
                return true;
              }
            }).length
          : 0;
        return {
          totalCount: (cur.totalCount += total),
          passCount: (cur.passCount += pass),
        };
      },
      {
        totalCount: 0,
        passCount: 0,
      },
    );

    return {
      total: totalCount,
      passCount,
      failCount: totalCount - passCount,
    };
  }

  // 计算该记录每一个节点的耗时累加
  accumulateFailCount(curNodes) {
    if (!curNodes || curNodes.length === 0) return 0;
    const duration = curNodes.reduce((cur, next) => {
      const count =
        next.data && next.data.build && next.data.build.state > 2 ? 1 : 0;
      return (cur += count);
    }, 0);
    return duration;
  }

  dealWithStatisticTaskRate(tasks, records) {
    const result = [];
    if (!tasks || tasks.length === 0 || !records || records.length === 0)
      return result;

    if (tasks.length === 0 || records.length === 0) return result;
    tasks.forEach((task) => {
      let nodes = [];
      records.forEach((record) => {
        const hasTaskNodes = record.nodes
          ? record.nodes.filter((item) => {
              // 是task 的构建记录 并且是有构建过的
              if (item.data && item.data.id === task.id && item.data.build) {
                return true;
              }
            })
          : [];
        nodes = [...nodes, ...hasTaskNodes];
      });

      const failCount = this.accumulateFailCount(nodes);

      if (nodes.length !== 0 && failCount !== 0) {
        result.push({
          failCount,
          totalCount: nodes.length,
          name: task.name,
          rate: Number(((failCount / nodes.length) * 100).toFixed(2)) || 0,
          id: task.id,
        });
      }
    });

    const fiveArr = result.sort((a, b) => b.rate - a.rate).slice(0, 5);

    return fiveArr;
  }

  async getPipilineRecordsTaskRate({ project_id }, { from, to, create_users }) {
    try {
      const records = await this.pipelineRecordsRepository
        .createQueryBuilder('pr')
        .where('pr.project_id = :project_id', { project_id })
        .andWhere('pr.created_at >= :from', { from })
        .andWhere('pr.created_at <= :to', { to })
        .andWhere('p.create_user_id in (:create_users)', {
          create_users: create_users || [],
        })
        .getMany();
      const arr = this.dealWithTaskStatistic(records);
      const tasks = await this.tasksService.getAllTasks({
        project_id,
      });

      const failTFPipelines = this.dealWithStatisticTaskRate(tasks, records);
      return {
        ...arr,
        failTFPipelines,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  dealWithTaskDayRate(records) {
    const data = records.map((record) => {
      const { total, passCount } = this.dealWithTaskStatistic([record]);

      return {
        day: record.day,
        total,
        passCount,
      };
    });

    return data;
  }

  async getPipelineRecordsTaskRateDay(
    { project_id },
    { from, to, create_users },
  ) {
    try {
      const records1 = await this.pipelineRecordsRepository
        .createQueryBuilder('pr')
        .where('pr.project_id = :project_id', { project_id })
        .andWhere('pr.created_at >= :from', { from })
        .andWhere('pr.created_at <= :to', { to })
        .andWhere('p.create_user_id in (:create_users)', {
          create_users: create_users || [],
        })
        .getMany();

      const records = this.dealWithTaskDayRate(records1);

      return {
        records,
        from,
        to,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 计算该记录每一个节点的耗时累加
  accumulateDuration = (curNodes) => {
    if (!curNodes || curNodes.length === 0) return 0;
    const duration = curNodes.reduce((cur, next) => {
      const time =
        next.data && next.data.build && next.data.build.duration
          ? next.data.build.duration
          : 0;
      return (cur += time);
    }, 0);
    return duration;
  };

  dealWithStatisticTaskDuration(tasks, records) {
    const result = [];
    if (tasks.length === 0 || records.length === 0) return result;
    tasks.forEach((task) => {
      let nodes = [];
      records.forEach((record) => {
        const hasTaskNodes = record.nodes
          ? record.nodes.filter((item) => {
              if (item.data && item.data.id === task.id) {
                return true;
              }
            })
          : [];
        nodes = [...nodes, ...hasTaskNodes];
      });

      const count = nodes.reduce((cur, next) => {
        return (cur += next.data && next.data.build ? 1 : 0);
      }, 0);
      const duration = this.accumulateDuration(nodes) / nodes.length || 0;

      result.push({
        duration,
        num: nodes.length,
        name: task.name,
        nickname: '',
        count,
        id: task.id,
      });
    });

    const fiveArr = result.sort((a, b) => b.duration - a.duration).slice(0, 5);

    return fiveArr;
  }

  async getTaskTopFiveDuration({ project_id }, { from, to, create_users }) {
    try {
      const records = await this.pipelineRecordsRepository
        .createQueryBuilder('pr')
        .where('pr.project_id = :project_id', { project_id })
        .andWhere('pr.created_at >= :from', { from })
        .andWhere('pr.created_at <= :to', { to })
        .andWhere('p.create_user_id in (:create_users)', {
          create_users: create_users || [],
        })
        .getMany();

      const tasks = await this.tasksService.getAllTasks({
        project_id,
      });

      const data = this.dealWithStatisticTaskDuration(tasks, records);

      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  aggregationRecordNodes(pid, records) {
    let result = [];
    if (!records || records.length === 0) return result;
    if (records.length === 0) return result;

    records.forEach((item) => {
      if (item.pipeline_id === pid && item.nodes && item.nodes.length !== 0) {
        result = [...result, ...item.nodes];
      }
    });

    return result;
  }

  dealWithTaskPipeRelation(tasks, pipelines, records) {
    const result = [];
    if (!tasks || !pipelines || !records) return result;
    const curPipelines = pipelines.map((item) => {
      // 从所有的记录当中 将同一个管线跑过的记录都合并到一起
      const nodes = this.aggregationRecordNodes(item.id, records);
      return {
        id: item.id,
        name: item.name,
        nodes,
      };
    });

    tasks.forEach((task) => {
      curPipelines.forEach((record) => {
        const hasTaskNum = record.nodes
          ? record.nodes.filter((item) => {
              if (item.data && item.data.id === task.id) {
                return true;
              }
            }).length
          : 0;

        if (hasTaskNum !== 0) {
          result.push({
            source: task.name,
            target: record.name,
            value: hasTaskNum,
          });
        }
      });
    });

    return result;
  }

  async getTaskAndPipelineRelation({ project_id }, { from, to, create_users }) {
    try {
      const tasks = await this.tasksService.getAllTasks({
        project_id,
      });
      const pipelines =
        await this.pipelinesListService.getAllPipelinesByProjectId({
          project_id,
        });

      const records = await this.pipelineRecordsRepository
        .createQueryBuilder('pr')
        .where('pr.project_id = :project_id', { project_id })
        .andWhere('pr.created_at >= :from', { from })
        .andWhere('pr.created_at <= :to', { to })
        .andWhere('p.create_user_id in (:create_users)', {
          create_users: create_users || [],
        })
        .getMany();

      const result = this.dealWithTaskPipeRelation(tasks, pipelines, records);
      return {
        data: result,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPipelineRunHistory({ project_id }, { from, to, create_users }) {
    try {
      const pipelines = await this.pipelinesRepository
        .createQueryBuilder('p')
        .where('p.project_id = :project_id', { project_id })
        .leftJoinAndMapMany(
          'p.records',
          'pipeline_records',
          'r',
          'r.pipeline_id = p.id AND r.created_at >= :from AND r.created_at <= :to AND create_users IN(:create_users)',
          { from, to, create_users },
        )
        .getMany();

      const result = await Promise.all(
        pipelines.map(async (item) => {
          const records = item['records'];
          const totalCount = records.length || 0;
          const passCount = records.filter((re) => re.status === 2).length;

          const duration =
            records.reduce((cur, next) => {
              return cur + next.duration;
            }, 0) / totalCount;
          return {
            ...item,
            totalCount,
            passCount,
            failCount: totalCount - passCount,
            rate: Number(((passCount / totalCount) * 100).toFixed(2)),
            num: item.nodes && item.nodes.length - 1,
            duration,
          };
        }),
      );

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  resultTaskStatistic(tasks, pipelines, records) {
    const result = [];

    if (!tasks || !pipelines || !records) return result;

    tasks.forEach((task) => {
      let tNodes = [];
      const refenceCount = pipelines.reduce((cur, next) => {
        const nodes = next.nodes ? JSON.parse(next.nodes) : [];
        const inThisPipe = nodes.some(
          (item) => item && item.data && item.data.id === task.id,
        );

        return (cur += inThisPipe ? 1 : 0);
      }, 0);
      records.forEach((record) => {
        const nodes = record.nodes
          ? record.nodes.filter((item) => {
              if (item.data && item.data.id === task.id) {
                return true;
              }
            })
          : [];
        tNodes = [...tNodes, ...nodes];
      });

      const totalCount = tNodes.length;
      const passCount = tNodes.filter((item) => {
        if (item.data && item.data.build && item.data.build.state === 2) {
          return true;
        }
      }).length;

      const performCount = tNodes.filter((item) => {
        if (item.data && item.data.build && item.data.build.state >= 2) {
          return true;
        }
      }).length;

      const duration =
        tNodes.reduce((cur, next) => {
          const time =
            next.data && next.data.build && next.data.build.duration
              ? next.data.build.duration
              : 0;
          return (cur += time);
        }, 0) / performCount;

      result.push({
        refenceCount,
        totalCount,
        passCount,
        performCount,
        id: task.id,
        failCount: performCount - passCount,
        displayName: task.display_name,
        rate: Number(((passCount / totalCount) * 100).toFixed(2)),
        duration,
      });
    });

    return result;
  }
  async getTaskInPipelineRecords({ project_id }, { from, to, create_users }) {
    try {
      const tasks = await this.tasksService.getAllTasks({
        project_id,
      });
      const pipelines =
        await this.pipelinesListService.getAllPipelinesByProjectId({
          project_id,
        });
      const records = await this.pipelineRecordsRepository
        .createQueryBuilder('pr')
        .where('pr.project_id = :project_id', { project_id })
        .andWhere('pr.created_at >= :from', { from })
        .andWhere('pr.created_at <= :to', { to })
        .andWhere('p.create_user_id in (:create_users)', {
          create_users: create_users || [],
        })
        .getMany();

      const result = this.resultTaskStatistic(tasks, pipelines, records);

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
