import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { MinioService } from 'src/modules/minio/minio.service';
import { Repository } from 'typeorm';
import { ResourceCategoryService } from '../category/category.service';
import { ResourceInstancesService } from '../instances/instances.service';
import { ResourceTermsService } from '../terms/terms.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import moment from 'moment';

@Injectable()
export class ResourceReportService {
  @Inject()
  private readonly resourceCategoryService: ResourceCategoryService;

  @Inject()
  private readonly minioService: MinioService;

  @Inject()
  private readonly resourceTermsService: ResourceTermsService;

  @Inject()
  private readonly resourceInstancesService: ResourceInstancesService;

  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  async getAllResourceTerms(project_id, results) {
    if (!results) {
      return [];
    }
    return Promise.all(
      results.map(async (item) => {
        const resouceTerms =
          await this.resourceTermsService.getOneResourceTermByUid(
            { project_id },
            item.rule_uid,
          );
        if (resouceTerms) {
          const classification =
            await this.resourceCategoryService.getOneClassificationById(
              resouceTerms.category_id,
            );
          if (classification) {
            return {
              category_name: classification.category_name,
              category_uid: classification.category_uid,
              level: resouceTerms.level,
              rule_desc: resouceTerms.rule_desc,
              rule_name: resouceTerms.rule_name,
              suggest: resouceTerms.suggest,
              ...item,
            };
          }
          return {
            ...item,
          };
        }
        return {
          ...item,
        };
      }),
    );
  }

  async getCheck(project_id, build) {
    const check = {
      totalCount: 0,
      notPassCount: 0,
      passCount: 0,
      failureCount: 0,
    };
    if (!build || !build.file_path) return check;
    let report;
    try {
      report = (await this.minioService.getObject(build.file_path)).data;
    } catch (error) {
      return check;
    }
    check.totalCount = report.results.length;
    report.results = await this.getAllResourceTerms(project_id, report.results);
    report.results.forEach((item) => {
      if (item.rule_results.length !== 0) {
        check.notPassCount += 1;
      }
      check.failureCount += item.rule_results.length;
    });
    check.passCount = check.totalCount - check.notPassCount;
    return check;
  }

  async getSummary(project_id, builds) {
    const summary = {
      totalCount: 0,
      passCount: 0,
      notPassCount: 0,
      failureCount: 0,
    };
    if (builds.length === 0) return summary;
    await Promise.all(
      builds.map(async (build) => {
        const check = await this.getCheck(project_id, build);
        summary.totalCount += check.totalCount;
        summary.passCount += check.passCount;
        summary.notPassCount += check.notPassCount;
        summary.failureCount += check.failureCount;
        return;
      }),
    );
    return summary;
  }

  // JSON_EXTRACT(parameters, "$.instance_id")= ?
  getCheckReportResult = async function (
    { project_id },
    { from, to, git_client_url, branch, ...queries },
  ) {
    const allBuilds = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .andWhere(
        "JSON_EXTRACT(b.parameters, '$.git_client_url') = :git_client_url",
        { git_client_url },
      )
      .andWhere('b.bagdes = :branch', { branch })
      .andWhere(queries)
      .getMany();

    // 过滤出符合分支条件的数据
    // const branchBuilds = allBuilds.filter((item) => item.badges.includes(branch));
    // 计算总的通过数
    const statistics = await this.getSummary(project_id, allBuilds);

    return {
      data: statistics,
    };
  };

  // 计算某一天内所有资源检查 检查项的通过率
  async dealWithCustomDataToRate(itemBuild) {
    const result = {
      pass: 0,
      total: 0,
      day: itemBuild.created_at,
    };
    if (!itemBuild || !itemBuild.file_path) return result;
    let report;
    try {
      report = (await this.minioService.getObject(itemBuild.file_path)).data;
    } catch (error) {
      return result;
    }

    report.results.forEach((item) => {
      result.pass += item.rule_results.length === 0 ? 1 : 0;
    });

    result.total = report.results.length;

    return result;
  }

  async getCheckReportRate(
    { project_id },
    { from, to, git_client_url, branch, ...queries },
  ) {
    const allBuilds = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .andWhere('b.status = :status', { status: 2 })
      .andWhere(
        "JSON_EXTRACT(b.parameters, '$.git_client_url') = :git_client_url",
        { git_client_url },
      )
      .andWhere('b.bagdes = :branch', { branch })
      .andWhere(queries)
      .getMany();

    // 计算每天的平均通过率和对应分支的通过率
    const result = await Promise.all(
      allBuilds.map(async (item) => {
        const res = await this.dealWithCustomDataToRate(item);
        return res;
      }),
    );

    return {
      records: result,
      from,
      to,
    };
  }

  // 计算每一个实例当天最晚的那一条数据 并且进行数据统计
  oneDayInstanceTerms = async (
    id,
    startDay,
    endDay,
    project_id,
    { git_client_url, branch }: { git_client_url?: string; branch?: string },
  ) => {
    const dcBuild = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', { build_type: CHECK })
      .andWhere('b.created_at >= :startDay', { startDay })
      .andWhere('b.created_at <= :endDay', { endDay })
      .andWhere('b.status = :status', { status: 2 })
      .andWhere(
        "JSON_EXTRACT(b.parameters, '$.git_client_url') = :git_client_url",
        { git_client_url },
      )
      .andWhere('b.bagdes = :branch', { branch })
      .orderBy('b.created_at', 'DESC')
      .getOne();
    const resObj = {};
    if (!dcBuild || !dcBuild.file_path) return resObj;
    let report;
    try {
      // report = JSON.parse(await app.ci.readFile(customData.report_url));
      report = (await this.minioService.getObject(dcBuild.file_path)).data;
      report.results = await this.getAllResourceTerms(
        project_id,
        report.results,
      );
      report.results.forEach((item) => {
        if (!resObj[item.category_uid]) {
          resObj[item.category_uid] = {
            warn: 0,
            serious: 0,
          };
        }
        if (item.level === 1) {
          resObj[item.category_uid].warn += item.rule_results.length;
        }
        if (item.level === 2) {
          resObj[item.category_uid].serious += item.rule_results.length;
        }
      });
      return resObj;
    } catch (error) {
      return resObj;
    }
  };

  // 计算分类中，每一个类别最新的数据
  async caculteEveryDayRate({ project_id, from, to, git_client_url, branch }) {
    let data = [];
    const oneDaySenconds = 24 * 60 * 60;
    let curDate = Number(to);
    let startDay = curDate - oneDaySenconds + 1;
    const allInstances =
      await this.resourceInstancesService.getAllResourceInstances({
        project_id,
      });
    // 这里可以先去获取所有的实例，然后求出实例当天最晚跑的那一次记录
    const checkTypes = app.utils.check_types.filter(
      (item) => item.value.length !== 0,
    );
    while (curDate >= from && curDate <= to) {
      const options = await Promise.all(
        allInstances.map(async (item) => {
          const res = await this.oneDayInstanceTerms(
            item.id,
            startDay,
            curDate,
            project_id,
            { git_client_url, branch },
          );
          return res;
        }),
      );

      const result = checkTypes.map((ctype) => {
        let num = 0;
        options.forEach((item) => {
          Object.keys(item).forEach((item1) => {
            if (ctype.value.includes(item1)) {
              const len = item[item1].warn + item[item1].serious;
              num += len;
            }
          });
        });

        return {
          type: ctype.type,
          day: curDate,
          value: num,
        };
      });

      data = [...data, ...result];

      // curDate = moment(curDate).add(1, 'd').format('YYYY-MM-DD');
      curDate -= oneDaySenconds;
      startDay = curDate - oneDaySenconds + 1;
    }
    return data;
  }

  async getCheckReportItemRate(quires) {
    const cateRates = await this.caculteEveryDayRate(quires);

    return cateRates;
  }

  async getCheckResult(project_id, build) {
    const check = {
      config: {},
      report: {
        results: [],
      },
      caveatCount: 0,
      seriousCount: 0,
      type: '',
    };
    if (!build || !build.file_path) return check;
    check.type = build.job_name;
    try {
      const result = await this.minioService.getObject(build.file_path);
      check.report = result.data;
    } catch (error) {
      return check;
    }
    check.report.results = await this.getAllResourceTerms(
      project_id,
      check.report.results,
    );
    check.report.results.forEach((item) => {
      item.status = item.rule_results.length > 0 ? 0 : 1;
    });

    return check;
  }

  fusionCheckOptions(checks, categories) {
    const items = [];
    checks.forEach((el) => {
      if (categories.includes(el.category_uid)) {
        items.push(el);
      }
    });

    const sortItems = items.sort((a, b) => {
      if (a.status === b.status) {
        if (a.level === b.level) {
          return b.rule_results.length - a.rule_results.length;
        } else {
          return b.level - a.level;
        }
      }
      return a.status - b.status;
    });

    return sortItems;
  }

  async fusionDiffertCategoryItems(checks) {
    const effectiveTypes = app.utils.check_types.filter(
      (item) => item.value.length !== 0,
    );
    const res = [];
    effectiveTypes.forEach((cate) => {
      const options = this.fusionCheckOptions(checks, cate.value);
      if (options.length !== 0) {
        res.push({
          name: cate.type,
          items: options,
        });
      }
    });
    return res;
  }

  async caculteCategroiesNum(project_id) {
    let categroies = [];
    const allInstances =
      await this.resourceInstancesService.getAllResourceInstances({
        project_id,
      });
    // 这里可以先去获取所有的实例，然后求出实例当天最晚跑的那一次记录
    const checkTypes = app.utils.check_types.filter(
      (item) => item.value.length !== 0,
    );

    const startDay = moment().startOf('day').format('X');
    const endDay = moment().endOf('day').format('X');
    const options = await Promise.all(
      allInstances.map(async (item) => {
        const res = await this.oneDayInstanceTerms(
          item.id,
          startDay,
          endDay,
          project_id,
          {},
        );
        return res;
      }),
    );

    checkTypes.forEach((ctype) => {
      let warn = 0;
      let serious = 0;
      options.forEach((item) => {
        Object.keys(item).forEach((item1) => {
          if (ctype.value.includes(item1)) {
            warn += item[item1].warn;
            serious += item[item1].serious;
          }
        });
      });

      categroies = [
        ...categroies,
        {
          status: '警告',
          category: ctype.type,
          value: warn,
        },
        {
          status: '严重',
          category: ctype.type,
          value: serious,
        },
      ];
    });

    return categroies;
  }

  async getDifferentCategoryLastBuild({ project_id }) {
    try {
      // const [allBuilds] = await app.mysql.query(tasksConstants.SELECT_LAST_SUCCESS_BUILD_LIMIT_ONE_BY_BUILD_TYPE, [CHECK, 2, project_id]);
      const build = await this.buildsRepository.findOne({
        where: {
          project_id,
          build_type: CHECK,
          status: 2,
        },
        order: {
          created_at: 'DESC',
        },
      });
      // 如果有分支就过滤出符合条件的构建 如果没有就默认最新的那个
      let cateChecksData = [];
      let categroies = [];
      try {
        const check = await this.getCheckResult(project_id, build);
        // 用于弹框展示具体的数据
        cateChecksData = await this.fusionDiffertCategoryItems(
          check.report.results,
        );
        // 用于计算分类不同的数据量 警告数和严重数
        categroies = await this.caculteCategroiesNum(project_id);
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        categroies,
        checksData: cateChecksData,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
