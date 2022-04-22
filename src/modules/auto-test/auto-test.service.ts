import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { Between, In, Repository } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { TasksService } from '../tasks/list/tasks.service';
import { TestErrorManualService } from '../test-error-manual/test-error-manual.service';
import { CreateAutoTestDto } from './dtos/create-auto-test.dto';
import { UpdateAutoTestDto } from './dtos/update-auto-test.dto';

@Injectable()
export class AutoTestService {
  @Inject()
  private readonly tasksService: TasksService;

  @Inject()
  private readonly minioService: MinioService;

  @Inject()
  private readonly testErrorManualSerivce: TestErrorManualService;

  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;
  // 累加案例结果
  accumulateTestResult(selBuilds = []) {
    const result = {
      pass_count: 0,
      fail_count: 0,
      total: 0,
    };
    if (selBuilds.length === 0) return result;
    const arr = [];
    selBuilds.forEach((item) => {
      if (item.custom_data) {
        const customData = item.custom_data
          ? JSON.parse(item.custom_data)
          : null;
        if (customData && customData.statist) {
          arr.push(customData.statist);
        } else {
          arr.push(result);
        }
      } else {
        arr.push(result);
      }
    });

    const total = arr.reduce((cur, next) => {
      const num = next && next.total ? next.total : 0;
      return (cur += num);
    }, 0);

    const pass_count = arr.reduce((cur, next) => {
      const num = next && next.pass_case ? next.pass_case : 0;
      return (cur += num);
    }, 0);

    const fail_count = arr.reduce((cur, next) => {
      const num = next && next.fail_case ? next.fail_case : 0;
      return (cur += num);
    }, 0);

    return {
      total,
      pass_count,
      fail_count,
    };
  }

  // 获取自动化测试结果
  async getReportResult({ project_id, from, to }) {
    // const [ builds ] = await app.mysql.query(autoTestConstants.SELECT_AUTO_TEST_RESULT_BY_BUILD_TYPE_PRJECT_ID, [ 'test', project_id, from, to ]);

    const builds = await this.buildsRepository.find({
      where: {
        build_type: 'test',
        project_id,
        time: Between(from, to),
      },
    });
    const result = this.accumulateTestResult(builds ?? []);
    return {
      data: result,
    };
  }

  async getDayCategoryFailCases(curDayData, categries, day) {
    const result = await Promise.all(
      categries.map(async (item) => {
        const cateData = curDayData.filter(
          (build) => build.job_name === item.name,
        );
        const sortData = cateData.sort((a, b) => b.time - a.time);
        const lasteData = sortData.length > 0 ? sortData[0] : null;
        const customData =
          lasteData && lasteData.custom_data
            ? JSON.parse(lasteData.custom_data)
            : null;
        return {
          name: item.display_name,
          day,
          value:
            (customData &&
              customData.statist &&
              customData.statist.fail_case) ||
            0,
        };
      }),
    );

    return result;
  }

  async categoryFailCases(from, to, selBuilds, project_id) {
    const oneDaySeconds = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySeconds - 1;
    let data = [];
    // 获取自动化测试分类
    const categries = await this.tasksService.getAllTasksByTags(
      utils.build_types.TEST,
      project_id,
    );
    while (curDay >= from && curDay <= to) {
      // 过滤出今天的数据
      const curDayData = selBuilds.filter(
        (item) => item.time >= curDay && item.time <= endCurDay,
      );
      const arr = await this.getDayCategoryFailCases(
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
  }

  async getFailCaseTrend({ project_id }, { from, to }) {
    // const [ builds ] = await app.mysql.query(autoTestConstants.SELECT_AUTO_TEST_RESULT_BY_BUILD_TYPE_PRJECT_ID, [ 'test', project_id, from, to ]);
    const builds = await this.buildsRepository.find({
      where: {
        build_type: 'test',
        project_id,
        time: Between(from, to),
      },
    });
    const result = await this.categoryFailCases(from, to, builds, project_id);
    return {
      data: result,
    };
  }

  async getDayCategoryTotalCases(curDayData, categries, day) {
    const result = await Promise.all(
      categries.map(async (item) => {
        const cateData = curDayData.filter(
          (build) => build.job_name === item.name,
        );
        // 过滤出这个分类今天最新的一条
        const sortData = cateData.sort((a, b) => b.time - a.time);
        const lasteData = sortData.length > 0 ? sortData[0] : null;
        const customData =
          lasteData && lasteData.custom_data
            ? JSON.parse(lasteData.custom_data)
            : null;
        return {
          name: item.display_name,
          day,
          value:
            (customData && customData.statist && customData.statist.total) || 0,
        };
      }),
    );

    return result;
  }

  async categoryTotalCases(from, to, selBuilds, project_id) {
    const oneDaySeconds = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySeconds - 1;
    let data = [];
    // 获取自动化测试分类
    const categries = await this.tasksService.getAllTasksByTags(
      utils.build_types.TEST,
      project_id,
    );
    while (curDay >= from && curDay <= to) {
      // 过滤出今天的数据
      const curDayData = selBuilds.filter(
        (item) => item.time >= curDay && item.time <= endCurDay,
      );
      const arr = await this.getDayCategoryTotalCases(
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
  }

  async getTotalCaseTrend({ project_id }, { from, to }) {
    // const [ builds ] = await app.mysql.query(autoTestConstants.SELECT_AUTO_TEST_RESULT_BY_BUILD_TYPE_PRJECT_ID, [ 'test', project_id, from, to ]);
    const builds = await this.buildsRepository.find({
      where: {
        build_type: 'test',
        project_id,
        time: Between(from, to),
      },
    });
    const result = await this.categoryTotalCases(from, to, builds, project_id);
    return {
      data: result,
    };
  }

  async dealWithCategoryLatest(selBuilds, project_id) {
    const result = await Promise.all(
      selBuilds.map(async (item) => {
        const task = await this.tasksService.getAllTasksByTagsAndName(
          item.job_name,
          utils.build_types.TEST,
          project_id,
        );
        const customData = item.custom_data
          ? JSON.parse(item.custom_data)
          : null;
        return {
          id: item.id,
          task_id: task?.id ?? undefined,
          name: task?.display_name ?? undefined,
          job_name: item.job_name,
          created_at: item.created_at,
          testModules:
            customData && customData.testModules ? customData.testModules : 0,
          pass_rate:
            customData && customData.statist ? customData.statist.rate : 0,
          fail_types:
            customData && customData.fail_types ? customData.fail_types : [],
        };
      }),
    );

    const data = result.filter((res) => res.task_id !== undefined);
    return data;
  }

  async getCategoryLatestBuild({ project_id }) {
    // const [ builds ] = await app.mysql.query(autoTestConstants.SELECT_AUTO_TEST_LAST_BUILD, [ 'test', project_id, 1 ]);
    // 获取每一个分类最新的一条数据
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
            build_type: utils.build_types.TEST,
          })
          .andWhere('project_id = :project_id', { project_id });
        return subQuery;
      }, 't')
      .where('t.rn = :rn', { rn: 1 })
      .getMany();

    const result = await this.dealWithCategoryLatest(builds, project_id);
    return {
      data: result,
    };
  }

  selTopNums(allFailTypes) {
    const typesMap = new Map();
    allFailTypes.forEach((item) => {
      if (!typesMap.has(item)) {
        typesMap.set(item, 1);
      } else {
        typesMap.set(item, typesMap.get(item) + 1);
      }
    });

    const typeKeys = [...typesMap.keys()];
    const result = typeKeys
      .map((el) => {
        const val = typesMap.get(el);
        return {
          error_code: el,
          nums: val,
        };
      })
      .sort((a, b) => b.nums - a.nums)
      .slice(0, 5);

    return result;
  }

  async caculateTopFive(selBuilds, project_id) {
    if (selBuilds.length === 0) return [];
    const allFailTypes = selBuilds
      .map((item) => {
        const customData = item.custom_data
          ? JSON.parse(item.custom_data)
          : null;
        if (customData && customData.fail_types) {
          return customData.fail_types;
        }
        return [];
      })
      .flat(Infinity);

    if (allFailTypes.length === 0) return [];
    const topFiveCodes = this.selTopNums(allFailTypes);

    const result = await Promise.all(
      topFiveCodes.map(async (item) => {
        const manual =
          await this.testErrorManualSerivce.getManualErrorsByErrorCode(
            item.error_code,
            project_id,
          );
        return {
          ...manual,
          nums: item.nums,
        };
      }),
    );

    const data = result.filter((el) => el && el.id);
    return data;
  }

  async getTopFailTypes({ project_id }) {
    // const [ builds ] = await app.mysql.query(autoTestConstants.SELECT_AUTO_TEST_BY_BUILD_TYPE_PROJECT_ID, [ 'test', project_id ]);
    const builds = await this.buildsRepository.find({
      where: {
        build_type: utils.build_types.TEST,
        project_id,
      },
    });
    const result = await this.caculateTopFive(builds, project_id);
    return {
      data: result,
    };
  }

  // 自动化测试通过率 计算每一个分类的案例通过率
  async dayTotalCateRate(item, cateData) {
    const result = {
      name: item.display_name,
      value: 0,
    };
    if (cateData.length === 0) return result;
    const total = cateData.reduce((cur, next) => {
      const customData = next.custom_data ? JSON.parse(next.custom_data) : null;
      const fail_count =
        customData && customData.statist && customData.statist.fail_case
          ? customData.statist.fail_case
          : 0;
      const pass_count =
        customData && customData.statist && customData.statist.pass_case
          ? customData.statist.pass_case
          : 0;

      const num = fail_count + pass_count;

      return (cur += num);
    }, 0);

    const pass_count = cateData.reduce((cur, next) => {
      const customData = next.custom_data ? JSON.parse(next.custom_data) : null;
      const num =
        customData && customData.statist && customData.statist.pass_case
          ? customData.statist.pass_case
          : 0;

      return (cur += num);
    }, 0);
    const rate = Number(((pass_count / total) * 100).toFixed(2));
    result.value = rate;

    return result;
  }

  getDayCategoryRate = async (curDayData, categries, day) => {
    const result = await Promise.all(
      categries.map(async (item) => {
        // 过滤出每个分类的数据
        const cateData = curDayData.filter(
          (build) => build.job_name === item.name,
        );
        const res = await this.dayTotalCateRate(item, cateData);
        return {
          ...res,
          day,
        };
      }),
    );

    return result;
  };

  async differentCategoryRate(from, to, selBuilds, project_id) {
    try {
      const oneDaySeconds = 24 * 60 * 60;
      let curDay = Number(from);
      let endCurDay = curDay + oneDaySeconds - 1;
      let data = [];
      // 获取自动化测试分类
      const categries = await this.tasksService.getAllTasksByTags(
        utils.build_types.TEST,
        project_id,
      );
      while (curDay >= from && curDay <= to) {
        // 过滤出今天的数据
        const curDayData = selBuilds.filter(
          (item) => item.time >= curDay && item.time <= endCurDay,
        );
        const arr = await this.getDayCategoryRate(
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
    } catch (error) {
      return {};
    }
  }

  getReportBuildRate = async ({ project_id }, { from, to }) => {
    // const [ builds ] = await app.mysql.query(autoTestConstants.SELECT_AUTO_TEST_RESULT_BY_BUILD_TYPE_PRJECT_ID, [ 'test', project_id, from, to ]);
    const builds = await this.buildsRepository.find({
      where: {
        build_type: 'test',
        project_id,
        time: Between(from, to),
      },
    });
    const result = await this.differentCategoryRate(
      from,
      to,
      builds,
      project_id,
    );
    return {
      data: result,
    };
  };

  async updateResultSuits(id, { suit }) {
    try {
      const build = await this.buildsRepository.findOne(id);
      const { file_path } = build;

      if (file_path) {
        const report = (await this.minioService.getObject(file_path)).data;
        report.suits.forEach((item) => {
          if (item.name === suit.name && item.suit_tag === suit.suit_tag) {
            item.fail_types = suit.fail_types;
          }
        });

        await this.minioService.putObject({
          val: JSON.stringify(report),
          pathDir: file_path,
        });
      }
    } catch (error) {
      return {
        error: {
          message: error,
        },
      };
    }

    return {};
  }
}
