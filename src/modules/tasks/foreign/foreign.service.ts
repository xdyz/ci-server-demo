import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity, UsersEntity } from 'src/entities';
import { JenkinsInfoService } from 'src/modules/jenkins-info/jenkins-info.service';
import { PackageErrorManualService } from 'src/modules/package-error-manual/package-error-manual.service';
import { Repository } from 'typeorm';
import { BuildsService } from '../builds/builds.service';
import got from 'got';
import * as utils from 'src/utils/index.utils';
import { WsService } from 'src/modules/websocket/ws.service';

@Injectable()
export class TasksForeignService {
  @Inject()
  private readonly jenkinsInfoService: JenkinsInfoService;

  @Inject()
  private readonly buildsServices: BuildsService;

  @Inject()
  private readonly wsService: WsService;

  @Inject()
  private readonly packageErrorManualService: PackageErrorManualService;

  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

  @InjectRepository(UsersEntity)
  private readonly usersRepository: Repository<UsersEntity>;

  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  maxWaitTime = 4 * 1000;

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
      jobRes = await got.get(
        `${baseUrl}/job/${replaceJobName}/${number}/api/json`,
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
    const res = await got.get(
      `${baseUrl}/job/${job_name}/${number}/consoleText`,
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
    const res = await got.get(log_url);

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
        console.log('beforeDealWithBuild error', git_list, error);
        // app.sentry.captureException(error);
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
}
