import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity, UsersEntity } from 'src/entities';
import { JenkinsInfoService } from 'src/modules/jenkins-info/jenkins-info.service';
import { PackageErrorManualService } from 'src/modules/package-error-manual/package-error-manual.service';
import { Repository } from 'typeorm';
import { BuildsService } from '../builds/builds.service';
import * as utils from 'src/utils/index.utils';
import { WsService } from 'src/modules/websocket/ws.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class BuildsForeignService {
  sentryClient: any;
  constructor(
    @InjectSentry() private readonly sentryService: SentryService,
    private readonly httpService: HttpService,
    private readonly jenkinsInfoService: JenkinsInfoService,
    private readonly buildsServices: BuildsService,
    private readonly wsService: WsService,
    private readonly packageErrorManualService: PackageErrorManualService,
  ) {
    this.sentryClient = this.sentryService.instance();
  }

  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

  @InjectRepository(UsersEntity)
  private readonly usersRepository: Repository<UsersEntity>;

  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  private maxWaitTime = 4 * 1000;

  async getJenkinsUrl(job_name, project_id) {
    try {
      // const [tasks] = await app.mysql.query(tasksConstants.SELECT_TASK_BY_NAME_AND_PROJECT_ID, [job_name, project_id]);
      // const [jenkins] = await app.mysql.query(jenkinsInfoConstants.SELECT_JENKINS_INFO_BY_ID, [tasks[0].jenkins_id]);
      // const { protocol, user_name, token, hostname, port } = jenkins[0];
      // baseUrl = `${protocol}://${user_name}:${token}@${hostname}:${port}`;
      const task = await this.tasksRepository.findOne({
        where: {
          job_name,
          project_id,
        },
      });
      const { baseUrl } = await this.jenkinsInfoService.getOneJenkinsInfoBYTask(
        task.jenkins_id,
      );
      return baseUrl;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      return '';
    }
  }

  async getBuildResult(baseUrl, job_name, number) {
    let waitTime = 1000;
    let jobRes, job;
    do {
      await utils.sleep(waitTime);
      waitTime = Math.min(this.maxWaitTime || 16 * 1000, waitTime * 2);
      const replaceJobName = job_name.replaceAll('/', '/job/');
      jobRes = await lastValueFrom(
        this.httpService
          .get(`${baseUrl}/job/${replaceJobName}/${number}/api/json`)
          .pipe(map((res) => res.data)),
      );
      job = JSON.parse(jobRes.body);
    } while (!job || job.result === null);

    return jobRes;
  }

  // 将上传的结果 中 baseUrl  buildResult  buildResult user parameters status 单独出来 有点冗余了
  // 这部分是公共的数据

  // 根据用户id 获取用户信息
  async getUserInfo(userId) {
    // const [users] = await app.mysql.query(usersConstants.SELECT_ONE_USER_BY_ID, [userId]);
    const user = await this.usersRepository.findOne(userId);
    const { nickname, id } = user;
    return {
      userName: nickname,
      userId: id,
    };
  }

  // 获取构建参数
  getBuildUser(actions) {
    if (actions.length === 0) return {};
    const action = actions.find(
      (item) => item._class === 'hudson.model.CauseAction',
    );
    const causes = action.causes.find(
      (casue) => casue._class === 'hudson.model.Cause$UserIdCause',
    );
    const { userId, userName } = causes;
    return { userId, userName };
  }

  // 从jenkins 的处理结果中，将构建参数，获取出来
  getBuildParameters(actions) {
    if (actions.length === 0) return {};
    const info = {};
    const action = actions.find(
      (item) => item._class === 'hudson.model.ParametersAction',
    );
    if (action && action.parameters) {
      action.parameters.forEach((params) => {
        info[params.name] = params.value;
      });
    }
    return info;
  }

  async getDataFromJenKinSResult(selBuild, job_name, project_id, build_id) {
    try {
      // 先获取到jenkins 访问地址
      const baseUrl = await this.getJenkinsUrl(job_name, project_id);
      // 获取构建结果信息，从而获取构建参数
      const buildResult = await this.getBuildResult(
        baseUrl,
        job_name,
        build_id,
      );

      const buildResultParse = JSON.parse(buildResult.body);
      // 获取构建用户  如果是已经有的那么就从用户充查询，如果不是则获取jenkins用户
      const user =
        selBuild && selBuild.user_id
          ? await this.getUserInfo(selBuild.user_id)
          : this.getBuildUser(buildResultParse.actions);

      // 获取构建参数
      const parameters = this.getBuildParameters(
        buildResultParse?.actions ?? [],
      );
      const status = await utils.convertJenkinsStatusToInt(
        buildResultParse.result,
      );

      return {
        baseUrl,
        duration: buildResultParse.duration,
        user,
        parameters,
        status,
      };
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      return {};
    }
  }

  async getJenkinsLogErrorManuals(
    baseUrl = '',
    job_name,
    number,
    manuals = [],
  ) {
    const data = [];
    if (!baseUrl || manuals.length === 0) return data;
    // const replaceJobName = job_name.replaceAll('/', '/job/');
    const res = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${job_name}/${number}/consoleText`)
        .pipe(map((res) => res.data)),
    );

    const jenkinsLog = res?.body ? res.body : '';

    manuals.forEach((item) => {
      if (jenkinsLog.includes(item.key_words)) {
        data.push(item.id);
      }
    });

    return data;
  }

  // 读取unity 日志
  async readUnityLog(log_url = '') {
    if (!log_url) return '';
    const res = await lastValueFrom(
      this.httpService.get(log_url).pipe(map((res) => res.data)),
    );

    return res;
  }

  async getUnityLogErrorManuals(log_urls = [], manuals = []) {
    const data = [];
    if (log_urls.length === 0 || manuals.length === 0) return data;

    for (let i = 0; i < log_urls.length; i++) {
      const el = log_urls[i];
      const filterManuals = manuals.filter(
        (item1) => !item1.tags || item1.tags.includes(el.tags),
      );
      const log = await this.readUnityLog(el.url);
      if (log && filterManuals.length !== 0) {
        filterManuals.forEach((item2) => {
          if (log.body.includes(item2.key_words)) {
            data.push(item2.id);
          }
        });
      }
    }

    return data;
  }

  // 更新build
  // { status, duration, custom_data, platform, id, error_manual_ids, file_path }
  async resultUpdateBuild(resUpBuildDto) {
    await this.buildsRepository.save(resUpBuildDto);

    // 通知websocket
    const build = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id: resUpBuildDto.id })
      .leftJoinAndMapOne('b.user', 'users', 'u', 'u.id = b.user_id')
      .getOne();

    // app.ci.emit('updateBuild', build);
    this.wsService.updateBuild(build);

    // 通知继续
    if (build.status > 1) {
      this.buildsServices.doBuildFinish(build.id);
    }

    return {};
  }
  // 新建build 此时build 是由jenkins 主动触发的
  // { job_name, number, parameters, status, duration, badges, custom_data, build_type, platform, error_manual_ids, file_path, project_id }

  async resultCreateBuild(resCreBuildDto) {
    try {
      const build = await this.buildsRepository.create(resCreBuildDto);
      const data = await this.buildsRepository.save(build);
      return data;
    } catch (error) {
      // app.sentry.captureException(error);
      // throw new Error(error);
      this.sentryClient.captureException(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //  处理好需要用到的数据，然后判断是否是 新建还是更新
  async beforeDealWithBuild(selBuild, req, reportUrl, project_id) {
    try {
      // 从当前行代码  到status 的 获取 是一个重复的过程  这个过程可以提出去单独处理
      const { build_id, job_name, result, git_list, log_urls, out_data } = req;

      const { baseUrl, duration, user, parameters, status } =
        await this.getDataFromJenKinSResult(
          selBuild,
          job_name,
          project_id,
          build_id,
        );

      // 读取jenkins 和 unity 的日志，分析其失败原因
      // 分析日志前 先获取到关键字信息
      const manualsRes =
        await this.packageErrorManualService.getAllErrorsManuals({
          project_id,
        });
      // 读取jenkins 日志  返回匹配到的关键字的id
      const jenkinsManuals = await this.getJenkinsLogErrorManuals(
        baseUrl,
        job_name,
        build_id,
        manualsRes,
      );
      const unityManuals = await this.getUnityLogErrorManuals(
        log_urls,
        manualsRes,
      );
      const endManuals = Array.from(
        new Set([...jenkinsManuals, ...unityManuals]),
      );

      const custom_data = JSON.stringify({
        report_url: reportUrl,
        is_pass: status === 2,
        git_list,
        result,
        log_urls,
        user,
        out_data,
      });
      let badges = '';
      try {
        badges = git_list[0].branch;
      } catch (error) {
        // app.sentry.captureException(error);
        this.sentryClient.captureException(error);
      }
      const params = {
        id: selBuild && selBuild.id ? selBuild.id : null,
        job_name,
        status,
        custom_data,
        number: build_id,
        duration: Math.ceil(duration / 1000) || 0,
        parameters: JSON.stringify(parameters),
        badges: badges,
        build_type: utils.buildTypes.PACKAGE,
        platform: result.platform,
        project_id,
        file_path: reportUrl,
        error_manual_ids: endManuals.length !== 0 ? endManuals.join(',') : '',
      };

      if (
        selBuild &&
        selBuild.id &&
        this.buildsServices.executingBuildMap[selBuild.id]
      ) {
        await this.buildsServices.addBuildBadge(selBuild.id, badges);
      }

      return selBuild && selBuild.id
        ? this.resultUpdateBuild(params)
        : this.resultCreateBuild(params);
    } catch (error) {
      // app.utils.log.error("beforeDealWithBuild error", error);
      // app.sentry.captureException(error);
      this.sentryClient.captureException('beforeDealWithBuild error', error);
      return '';
    }
  }

  // 更新或者新建打包构建任务
  async uploadResultBuild(req, reportUrl) {
    const { build_id, job_name, project_id } = req;
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILDS_BY_NUMBER_AND_JOB_NAME_AND_PROJECT_ID, [build_id, job_name, project_id]);
    const build = await this.buildsRepository.findOne({
      where: {
        number: build_id,
        job_name,
        project_id,
      },
    });
    return await this.beforeDealWithBuild(build, req, reportUrl, project_id);
  }

  // 更新build
  // { status, duration, custom_data, file_path, id }
  async testResultUpdateBuild({ id, ...testUpBuildDto }) {
    // const connection = await app.mysql.getConnection();
    // try {
    //   await connection.beginTransaction();
    //   await connection.query(tasksConstants.UPDATE_BUILDS_WITH_TEST_INFO, [status, duration, custom_data, file_path, id]);
    //   await connection.commit();
    // } catch (error) {
    //   await connection.rollback();
    //   throw error;
    // } finally {
    //   await connection.release();
    // }
    await this.buildsRepository.save({ id, ...testUpBuildDto });

    // 通知websocket
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID, [id]);
    // const curBuild = builds[0];
    // const [users] = await app.mysql.query(usersConstants.SELECT_ONE_USER_BY_ID, [curBuild.user_id]);
    // curBuild['user'] = users[0];
    const curBuild = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .leftJoinAndMapOne('b.user', 'users', 'u', 'u.id = b.user_id')
      .getOne();
    // app.ci.emit('updateBuild', curBuild);
    this.wsService.updateBuild(curBuild);

    this.buildsServices.doBuildFinish(id);
    return {};
  }
  // 新建build 此时build 是由jenkins 主动触发的
  // { job_name, number, parameters, status, duration, badges, custom_data, build_type, file_path, project_id }
  async testResultCreateBuild(testCrBuildDto) {
    // const connection = await app.mysql.getConnection();
    // try {
    //   await connection.beginTransaction();
    //   await connection.query(
    //     tasksConstants.INSERT_BUILD_WITH_TEST_INFO,
    //     [build_type, job_name, number, status, duration, badges, parameters, custom_data, file_path, project_id]);
    //   await connection.commit();
    // } catch (error) {
    //   await connection.rollback();
    //   throw error;
    // } finally {
    //   await connection.release();
    // }
    // return {};
    try {
      const build = await this.buildsRepository.create(testCrBuildDto);
      await this.buildsRepository.save(build);

      return {};
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      // throw new Error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 自动化测试结果统计 （总数，失败数，通过数，通过率）
  statisResult(pass_case, fail_case) {
    const total = Number(pass_case) + Number(fail_case);
    const rate =
      total !== 0 ? Number(((pass_case / total) * 100).toFixed(2)) : 0;
    return {
      total,
      pass_case,
      rate,
      fail_case,
    };
  }

  statisMachine(suits = []) {
    if (suits.length === 0) return 0;
    const sequences = [];
    suits.forEach((item) => {
      if (item && item.device && item.device.sequence) {
        sequences.push(item.device.sequence);
      }
    });

    const result = Array.from(new Set(sequences)).length;
    return result;
  }

  async beforeDealWithTestBuild(selBuild, req, reportUrl, project_id) {
    try {
      const {
        build_id,
        job_name,
        pass_case,
        fail_case,
        duration_time,
        fail_types,
        suits,
        out_data,
      } = req;

      const { user, parameters, status } = await this.getDataFromJenKinSResult(
        selBuild,
        job_name,
        project_id,
        build_id,
      );
      // // 先获取到jenkins 访问地址
      // const baseUrl = await getJenkinsUrl(job_name, project_id);

      // // 获取构建结果信息，从而获取构建参数
      // const buildResult = await getBuildResult(baseUrl, job_name, build_id);

      // const buildResultParse = JSON.parse(buildResult.body);
      // // // 获取构建用户  如果是已经有的那么就从用户充查询，如果不是则获取jenkins用户
      // const user = selBuild && selBuild.user_id ? await getUserInfo(selBuild.user_id) : getBuildUser(buildResultParse.actions);

      // // 获取构建参数
      // const parameters = getBuildParameters(buildResultParse.actions);
      // const status = await app.utils.check_status.convertJenkinsStatusToInt(buildResultParse.result);

      // 根据结果统计 （总数，失败数，通过数，通过率） 机器数（去重），  失败的类型
      const statist = this.statisResult(pass_case, fail_case);
      const machines = this.statisMachine(suits);

      const custom_data = JSON.stringify({
        report_url: reportUrl,
        is_pass: status === 2,
        fail_types,
        user,
        statist,
        testModules: suits.length || 0,
        machines,
        out_data,
      });

      const params = {
        id: selBuild && selBuild.id ? selBuild.id : null,
        job_name,
        status,
        custom_data,
        number: build_id,
        duration: Math.ceil(duration_time / 1000) || 0,
        parameters: JSON.stringify(parameters),
        badges: parameters?.['branch'] || '',
        build_type: utils.buildTypes.TEST,
        file_path: reportUrl,
        project_id,
      };

      return selBuild && selBuild.id
        ? this.testResultUpdateBuild(params)
        : this.testResultCreateBuild(params);
    } catch (error) {
      // app.utils.log.error("beforeDealWithTestBuild error", error);
      // app.sentry.captureException(error);
      this.sentryClient.captureException(
        'beforeDealWithTestBuild error',
        error,
      );
      return '';
    }
  }

  // 更新或者新建自动化测试构建任务
  async uploadTestResultBuild(req, reportUrl) {
    const { build_id, job_name, project_id } = req;
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILDS_BY_NUMBER_AND_JOB_NAME_AND_PROJECT_ID, [build_id, job_name, project_id]);
    const build = await this.buildsRepository.findOne({
      where: {
        number: build_id,
        job_name,
        project_id,
      },
    });
    return await this.beforeDealWithTestBuild(
      build,
      req,
      reportUrl,
      project_id,
    );
  }

  //{ status, duration, custom_data, file_path, id }
  async serverResultUpdateBuild({ id, ...serverUpBuildDto }) {
    // const connection = await app.mysql.getConnection();

    // try {
    //   await connection.beginTransaction();
    //   await connection.query(tasksConstants.UPDATE_BUILDS_WITH_SERVER_INFO, [status, duration, custom_data, file_path, id]);
    //   await connection.commit();
    // } catch (error) {
    //   await connection.rollback();
    //   throw error;
    // } finally {
    //   await connection.release();
    // }
    await this.buildsRepository.save({ id, ...serverUpBuildDto });

    // 通知websocket
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID, [id]);
    // const curBuild = builds[0];
    // const [users] = await app.mysql.query(usersConstants.SELECT_ONE_USER_BY_ID, [curBuild.user_id]);
    // curBuild['user'] = users[0];
    const curBuild = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id })
      .leftJoinAndMapOne('b.user', 'users', 'u', 'u.id = b.user_id')
      .getOne();

    // 通知websocket
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID, [id]);
    // const curBuild = builds[0];
    // const [users] = await app.mysql.query(usersConstants.SELECT_ONE_USER_BY_ID, [curBuild.user_id]);
    // curBuild['user'] = users[0];
    // app.ci.emit('updateBuild', curBuild);
    this.wsService.updateBuild(curBuild);
    // doBuildFinish(id);
    this.buildsServices.doBuildFinish(id);
    return {};
  }

  //{ job_name, number, parameters, status, duration, badges, custom_data, build_type, file_path, project_id }
  async serverResultCreateBuild(serverCrBuildDto) {
    // const connection = await app.mysql.getConnection();
    // try {
    //   await connection.beginTransaction();
    //   await connection.query(
    //     tasksConstants.INSERT_BUILD_WITH_SERVER_INFO,
    //     [build_type, job_name, number, status, duration, badges, parameters, custom_data, file_path, project_id]);
    //   await connection.commit();
    // } catch (error) {
    //   await connection.rollback();
    //   throw error;
    // } finally {
    //   await connection.release();
    // }

    // return {};
    try {
      const build = await this.buildsRepository.create(serverCrBuildDto);
      await this.buildsRepository.save(build);
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      // throw new Error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async beforeDealWithServerBuild(selBuild, req, reportUrl, project_id) {
    try {
      const { build_id, job_name, out_data } = req;
      const { duration, user, parameters, status } =
        await this.getDataFromJenKinSResult(
          selBuild,
          job_name,
          project_id,
          build_id,
        );
      // // 先获取到jenkins 访问地址
      // const baseUrl = await getJenkinsUrl(job_name, project_id);

      // // 获取构建结果信息，从而获取构建参数
      // const buildResult = await getBuildResult(baseUrl, job_name, build_id);

      // const buildResultParse = JSON.parse(buildResult.body);
      // // 获取构建用户  如果是已经有的那么就从用户充查询，如果不是则获取jenkins用户
      // const user = selBuild && selBuild.user_id ? await getUserInfo(selBuild.user_id) : getBuildUser(buildResultParse.actions);
      // // 获取构建参数
      // const parameters = getBuildParameters(buildResultParse.actions);
      // const status = await app.utils.check_status.convertJenkinsStatusToInt(buildResultParse.result);
      const custom_data = JSON.stringify({
        report_url: reportUrl,
        is_pass: status === 2,
        user,
        out_data,
      });

      const params = {
        id: selBuild && selBuild.id ? selBuild.id : null,
        job_name,
        status,
        custom_data,
        number: build_id,
        duration: Math.ceil(duration / 1000) || 0,
        parameters: JSON.stringify(parameters),
        badges: parameters?.['branch'] || '',
        build_type: utils.buildTypes.SERVER,
        file_path: reportUrl,
        project_id,
      };

      return selBuild && selBuild.id
        ? this.serverResultUpdateBuild(params)
        : this.serverResultCreateBuild(params);
    } catch (error) {
      // app.utils.log.error("beforeDealWithServerBuild error", error);
      // app.sentry.captureException(error);
      this.sentryClient.captureException(
        'beforeDealWithServerBuild error',
        error,
      );
      return '';
    }
  }

  // 更新或者新建服务器构建任务
  async uploadServerResultBuild(req, reportUrl) {
    const { build_id, job_name, project_id } = req;
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILDS_BY_NUMBER_AND_JOB_NAME_AND_PROJECT_ID, [build_id, job_name, project_id]);
    const build = await this.buildsRepository.findOne({
      where: {
        number: build_id,
        job_name,
        project_id,
      },
    });
    return await this.beforeDealWithServerBuild(
      build,
      req,
      reportUrl,
      project_id,
    );
  }
}
