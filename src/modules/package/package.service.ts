import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';
import { CreatePackageDto } from './dtos/create-package.dto';
import { UpdatePackageDto } from './dtos/update-package.dto';
// import { got } from 'got';
import * as utils from 'src/utils/index.utils';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class PackageService {
  constructor(
    private httpService: HttpService,

    @Inject(forwardRef(() => PackageErrorManualService))
    private readonly packageErrorManualService: PackageErrorManualService,
    private readonly jenkinsInfoService: JenkinsInfoService,
  ) {}

  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

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

  async getPackages({ project_id }, { page, size, status, ...rest }) {
    page = parseInt(page) || 1;
    size = parseInt(size) || 10;
    const queries = this.dealWithQuery(rest);

    const [builds, total] = await this.buildsRepository
      .createQueryBuilder('b')
      .leftJoinAndMapOne('b.user', 'UsersEntity', 'u', 'b.user_id = u.id')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.status = :status', { status })
      .andWhere(queries)
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .orderBy('b.created_at', 'DESC')
      .offset((page - 1) * size)
      .limit(size)
      .getManyAndCount();
    return {
      builds,
      total,
    };
  }

  async getPackageDetail(id) {
    // const [packages] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_ID, [id]);
    const data = await this.buildsRepository
      .createQueryBuilder('b')
      .addSelect('UNIX_TIMESTAMP(b.created_at) as created_at')
      .where('b.id = :id', { id })
      .getOne();
    return data;
  }

  // 计算安装包的平均耗时
  async cacultePackageDayDuration(from, to, packages) {
    let data = [];
    const oneDaySecond = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySecond - 1;
    while (curDay >= from && curDay <= to) {
      // 过滤出当天的数据
      const androidPacks = packages.filter(
        (pack) =>
          pack.platform === 'android' &&
          pack.created_at <= endCurDay &&
          pack.created_at >= curDay,
      );
      const iosPacks = packages.filter(
        (pack) =>
          pack.platform === 'ios' &&
          pack.created_at <= endCurDay &&
          pack.created_at >= curDay,
      );
      const androidDuration = androidPacks.reduce((cur, next) => {
        return (cur += next.duration);
      }, 0);

      const iosDuration = iosPacks.reduce((cur, next) => {
        return (cur += next.duration);
      }, 0);

      data = [
        ...data,
        {
          name: 'Android',
          day: curDay,
          value:
            androidPacks.length !== 0
              ? Number(
                  (androidDuration / (androidPacks.length * 60)).toFixed(2),
                )
              : 0,
        },
        {
          name: 'iOS',
          day: curDay,
          value:
            iosPacks.length !== 0
              ? Number((iosDuration / (iosPacks.length * 60)).toFixed(2))
              : 0,
        },
      ];

      // curDate = moment(curDate).add(1, 'd').format('YYYY-MM-DD');
      curDay += oneDaySecond;

      endCurDay = curDay + oneDaySecond - 1;
    }
    return data;
  }

  // 计算成功率
  async cacultePackageDayRate(from, to, packages) {
    let data = [];
    const oneDaySecond = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySecond - 1;
    while (curDay >= from && curDay <= to) {
      // 过滤出当天的数据
      const androidPacks = packages.filter(
        (pack) =>
          pack.platform === 'android' &&
          pack.created_at <= endCurDay &&
          pack.created_at >= curDay,
      );
      const androidIsPass = androidPacks.filter((item) => item.status === 2);
      const iosPacks = packages.filter(
        (pack) =>
          pack.platform === 'ios' &&
          pack.created_at <= endCurDay &&
          pack.created_at >= curDay,
      );
      const iosIsPass = iosPacks.filter((item) => item.status === 2);

      data = [
        ...data,
        {
          name: 'Android',
          day: curDay,
          value:
            androidPacks.length !== 0
              ? Number(
                  ((androidIsPass.length / androidPacks.length) * 100).toFixed(
                    2,
                  ),
                )
              : 0,
        },
        {
          name: 'iOS',
          day: curDay,
          value:
            iosPacks.length !== 0
              ? Number(((iosIsPass.length / iosPacks.length) * 100).toFixed(2))
              : 0,
        },
      ];

      // curDate = moment(curDate).add(1, 'd').format('YYYY-MM-DD');
      curDay += oneDaySecond;

      endCurDay = curDay + oneDaySecond - 1;
    }
    return data;
  }

  async getPackageReportDuration({ project_id }, { from, to }) {
    // const [packages] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_DATE, [from, to, PACKAGE, project_id]);
    const packages = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();
    const result = await this.cacultePackageDayDuration(from, to, packages);
    return result;
  }

  async getPackageReportRate({ project_id }, { from, to }) {
    // const [packages] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_DATE, [from, to, PACKAGE, project_id]);
    const packages = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();
    const result = await this.cacultePackageDayRate(from, to, packages);
    return result;
  }

  // 计算通过数 和 未通过数
  caculatePassAndNotPass(selBuilds) {
    const result = {
      passCount: 0,
      notPassCount: 0,
    };
    if (selBuilds.length === 0) return result;

    result.passCount = selBuilds.filter((item) => item.status === 2).length;
    result.notPassCount = selBuilds.filter((item) => item.status > 2).length;

    return result;
  }

  async getPackageReportResult({ project_id, from, to }) {
    // const [packBuilds] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_DATE, [from, to, PACKAGE, project_id]);
    const [packages, count] = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getManyAndCount();
    const result = this.caculatePassAndNotPass(packages);
    return {
      ...result,
      totalCount: count,
    };
  }

  // 计算每天的日期两个分类的数据 通过和不通过数
  caculteTiemCategory(from, to, packBuilds) {
    const oneDaySecond = 24 * 60 * 60;
    let curDay = Number(from);
    let endCurDay = curDay + oneDaySecond - 1;
    let data = [];
    while (curDay >= from && curDay <= to) {
      const androidBuilds = packBuilds.filter(
        (item) =>
          item.created_at <= endCurDay &&
          item.created_at >= curDay &&
          item.platform === 'android',
      );
      const iosBuilds = packBuilds.filter(
        (item) =>
          item.created_at <= endCurDay &&
          item.created_at >= curDay &&
          item.platform === 'ios',
      );
      const androidRes = this.caculatePassAndNotPass(androidBuilds);
      const iosRes = this.caculatePassAndNotPass(iosBuilds);
      data = [
        ...data,
        {
          type: 'Android - 通过数',
          day: curDay,
          value: androidRes.passCount,
          name: 'android',
        },
        {
          type: 'Android - 未通过数',
          day: curDay,
          value: androidRes.notPassCount,
          name: 'android',
        },
        {
          type: 'iOS - 通过数',
          day: curDay,
          value: iosRes.passCount,
          name: 'ios',
        },
        {
          type: 'iOS - 未通过数',
          day: curDay,
          value: iosRes.notPassCount,
          name: 'ios',
        },
      ];

      // curDay = moment(curDay).add(1, 'd').format('YYYY-MM-DD');
      curDay += oneDaySecond;

      endCurDay = curDay + oneDaySecond - 1;
    }

    return data;
  }

  async getPackageReportCategory({ project_id }, { from, to }) {
    // const [packBuilds] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_DATE, [from, to, PACKAGE, project_id]);
    const packages = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();
    const result = this.caculteTiemCategory(from, to, packages);

    return result;
  }

  async getFailureHistoryData({ project_id }, { from, to }) {
    // const [failureHistories] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_FAILED_HISTORY, [PACKAGE, project_id, 3, '', from, to]);
    const failureHistories = await this.buildsRepository
      .createQueryBuilder('b')
      .leftJoinAndMapOne('b.user', 'UsersEntity', 'u', 'u.id = b.user_id')
      .addSelect('u.nickname')
      .addSelect('UNIX_TIMESTAMP(b.created_at) as created_at')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .andWhere('b.status >= :status', { status: 3 })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();
    failureHistories.forEach((item) => {
      if (item.custom_data) {
        item.custom_data = JSON.parse(item.custom_data);
      }
    });

    return failureHistories;
  }

  caculteTopFiveManualId = async (errorManuals) => {
    const errors = errorManuals.reduce((cur, next) => {
      next.error_manual_ids = next.error_manual_ids
        ? next.error_manual_ids.split(',').map((item) => Number(item))
        : [];
      return [...cur, ...next.error_manual_ids];
    }, []);
    if (errors.length === 0) return [];
    const errMap = new Map();
    errors.forEach((el) => {
      if (!errMap.get(el)) {
        errMap.set(el, 1);
      } else {
        errMap.set(el, errMap.get(el) + 1);
      }
    });

    const mapKeys = [...errMap.keys()];

    const mapKeyValues = mapKeys
      .map((key) => {
        return {
          key,
          value: errMap.get(key),
        };
      })
      .sort((a, b) => b.value - a.value);

    const keysArr =
      mapKeyValues.length > 5 ? mapKeyValues.slice(0, 5) : mapKeyValues;
    return keysArr;
  };

  async caculteTopFive(errorManuals = []) {
    let result = [];
    try {
      if (errorManuals.length === 0) return result;

      const keysArr = await this.caculteTopFiveManualId(errorManuals);

      result = await Promise.all(
        keysArr.map(async (item) => {
          // const [manuals] = await app.mysql.query(packageErrorManualConstants.SELECT_PACKAGE_ERROR_MANUAL_BY_ID, [item.key]);
          // 这里直接从package_error_manual service中调用查询方法即可
          const manual =
            await this.packageErrorManualService.getOneManualErrorById(
              item.key,
            );
          return {
            ...manual,
            number: item.value,
          };
        }),
      );

      return result;
    } catch (error) {
      return result;
    }
  }

  async getTopFiveErrorManuals({ project_id }, { from, to }) {
    // const [errorManuals] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_DATE, [from, to, PACKAGE, project_id]);
    const packages = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere('b.build_type = :build_type', {
        build_type: utils.buildTypes.PACKAGE,
      })
      .andWhere('b.created_at >= :from', { from })
      .andWhere('b.created_at <= :to', { to })
      .getMany();

    const data = await this.caculteTopFive(packages);

    return data;
  }

  // 读取unity 日志
  async readUnityLog(log_url = '') {
    if (!log_url) return { body: '' };
    const res = await lastValueFrom(
      this.httpService.get<any>(log_url).pipe(map((res) => res.data)),
    );

    return res;
  }
  // 获取unity 日志
  getBuildUnityLog = async (url, project_id) => {
    // const [manuals] = await app.mysql.query(packageErrorManualConstants.SELECT_PACKAGE_ERROR_MANUAL_BY_PROJECT_ID_AND_TAGS, [project_id, 'Unity']);
    // 查询tags in (Unity)的所有manual

    const manuals =
      await this.packageErrorManualService.getManualsByProjectIdAndTags({
        project_id,
        tags: ['Unity'],
      });
    const log = await this.readUnityLog(url);
    const result = manuals.filter((item) => {
      return log?.body?.includes(item.key_words);
    });
    return result;
  };

  // 获取jenkins 日志中的错误项
  getBuildJenkinsLog = async (
    baseUrl = '',
    job_name = '',
    number,
    project_id,
  ) => {
    let result = [];
    if (!baseUrl || !job_name || !number) return result;
    // const [manuals] = await app.mysql.query(packageErrorManualConstants.SELECT_PACKAGE_ERROR_MANUAL_BY_PROJECT_ID_AND_TAGS, [project_id, 'Jenkins']);
    const manuals =
      await this.packageErrorManualService.getManualsByProjectIdAndTags({
        project_id,
        tags: ['Jenkins'],
      });
    const res = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${job_name}/${number}/consoleText`)
        .pipe(map((res) => res.data)),
    );
    const jenkinsLog = res ? res.body : '';
    result = manuals.filter((item) => {
      if (jenkinsLog.includes(item.key_words)) {
        return item;
      }
    });

    return result;
  };

  // const getOneJenkinsInfoBYTask = async (jenkins_id) => {
  //   const res = await app.ci.getOneJenkinsInfo(jenkins_id);
  //   const { protocol, user_name, token, hostname, port } = res.data;
  //   return {
  //     baseUrl: `${protocol}://${user_name}:${token}@${hostname}:${port}`,
  //     jenkinsUrl: `${protocol}://${hostname}:${port}`
  //   };
  // };

  async getJenkinsAndUnityManuals({ project_id }, { build_id }) {
    const result = {
      jenkinsManuals: [],
      unityManuals: [],
    };
    try {
      // const [builds] = await app.mysql.query(packagesConstants.SELECT_PACKAGE_BUILDS_BY_ID, [build_id]);
      const build = await this.buildsRepository
        .createQueryBuilder('b')
        .addSelect('UNIX_TIMESTAMP(b.created_at) as created_at')
        .where('b.id = :id', { id: build_id })
        .getOne();
      // const build = builds[0];

      // 从tasks service 中去调用方法即可 或者直接从tasks表中查询 因为这里只需要一个jenkinsId
      // const [tasks] = await app.mysql.query(tasksConstants.SELECT_TASK_BY_ID, [build.task_id]);
      const { jenkins_id } = await this.tasksRepository.findOne({
        id: build.task_id,
      });
      // const task = tasks[0];
      let unityLogUrl = null;
      if (build.custom_data) {
        const log_urls = JSON.parse(build.custom_data).log_urls;
        unityLogUrl = log_urls.find((item) => item.tags.includes('Unity'));
      }
      // const { baseUrl } = await getOneJenkinsInfoBYTask(task.jenkins_id);
      const { baseUrl } = await this.jenkinsInfoService.getOneJenkinsInfoBYTask(
        jenkins_id,
      );
      // const baseUrl = await getJenkinsUrl(build.job_name);
      // 读取jenkins 日志  返回匹配到的关键字的id
      result.jenkinsManuals = await this.getBuildJenkinsLog(
        baseUrl,
        build.job_name,
        build.number,
        project_id,
      );
      result.unityManuals = await this.getBuildUnityLog(
        project_id,
        unityLogUrl.url,
      );
    } catch (error) {
      return result;
    }

    return result;
  }
}
