import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity, UsersEntity } from 'src/entities';
import { JenkinsInfoService } from 'src/modules/jenkins-info/jenkins-info.service';
import { ResourceInstanceItemsService } from 'src/modules/resource/items/items.service';
import { Repository } from 'typeorm';
// import { got } from 'got';
import { MinioClientService } from 'src/modules/minio-client/minio-client.service';
import { ProjectsService } from 'src/modules/projects/projects.service';
import { GitInfoService } from 'src/modules/git-info/git-info.service';

import * as utils from 'src/utils/index.utils';
import { TasksService } from '../tasks/tasks.service';
import { WsService } from 'src/modules/websocket/ws.service';
import { PipelinesService } from 'src/modules/pipelines/pipelines.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class BuildsService {
  sentryClient: any;
  constructor(
    // private httpService: HttpService,
    private httpService: HttpService,
    @Inject(forwardRef(() => TasksService))
    private readonly tasksService: TasksService,
    private readonly jenkinsInfoService: JenkinsInfoService,
    private readonly resourceInstanceItemsService: ResourceInstanceItemsService,
    private readonly wsService: WsService,
    private readonly minioClientService: MinioClientService,
    private readonly projectsService: ProjectsService,
    private readonly gitInfoService: GitInfoService,
    @InjectSentry()
    private readonly sentryService: SentryService,
    @Inject(forwardRef(() => PipelinesService))
    private readonly pipelinesService: PipelinesService,
  ) {
    this.sentryClient = this.sentryService.instance();
  }

  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  @InjectRepository(UsersEntity)
  private readonly usersRepository: Repository<UsersEntity>;

  @InjectRepository(TasksEntity)
  private readonly tasksRepository: Repository<TasksEntity>;

  public executingBuildMap = {};
  public executingBuildExtraMap = {};

  async addBuildBadge(buildId, badge) {
    const build = this.executingBuildMap[buildId];
    if (!build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    build.badges.push(badge);
    // await app.mysql.query(tasksConstants.UPDATE_BUILDS_BADGES_BY_ID, [build.badges.join(','), buildId]);
    await this.buildsRepository.save({
      id: buildId,
      badges: build.badges.join(','),
    });
  }

  async updateBuildCustomData(buildId, customData) {
    const build = this.executingBuildMap[buildId];
    if (!build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    build.custom_data = customData;
    // await app.mysql.query(tasksConstants.UPDATE_BUILDS_CUSTOM_DATA_BY_ID, [customData, buildId]);
    await this.buildsRepository.save({ id: buildId, custom_data: customData });
  }

  async updateBuildFilePath(buildId, filePath) {
    const build = this.executingBuildMap[buildId];
    if (!build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    build.file_path = filePath;
    // await app.mysql.query(tasksConstants.UPDATE_BUILDS_FILE_PATH_DATA_BY_ID, [filePath, buildId]);
    await this.buildsRepository.save({ id: buildId, file_path: filePath });
  }

  // ????????????????????????
  async beforeCheckJob(build) {
    const {
      id,
      task_id,
      parameters: {
        instance_id,
        git_client_url,
        branch,
        unity_check_sdk_branch,
        platform,
        hashes,
        unity_version,
        filter_time,
        customize_tool_url,
      },
      job_name: jenkinsJobName,
      project_id,
      build_type,
    } = build;
    const task = this.tasksService.taskMap[task_id];

    // ???????????????jenkins check job_name
    await this.addBuildBadge(id, branch);
    const { configs, params } =
      await this.resourceInstanceItemsService.getAllResourceInstancesItems(
        instance_id,
        project_id,
      );
    if (!configs || configs.length === 0) {
      throw new Error('instances cannot be empty');
    }
    const { git_url } = await this.gitInfoService.getGitInfoBySSH(
      project_id,
      git_client_url,
    );

    const jobParams = {
      context: JSON.stringify({
        branch: branch,
        unity_check_sdk_branch: unity_check_sdk_branch || 'master',
        platform: platform || 'android',
        filter_time,
        // detector: job_name,
        // drive_type: parameters.drive_type || 'Unity',
        params: params,
        configs: configs,
        hashes: hashes,
        project_id: project_id,
        unity_version: unity_version, // Unity??????
        customize_tool_url: customize_tool_url, // ????????????????????????
        git_url: git_url, // git??????
      }),
    };
    await this.executeJob(
      id,
      task,
      jobParams,
      jenkinsJobName,
      build_type,
      project_id,
    );
  }

  async updateBuildNumber(buildId, number) {
    const build = this.executingBuildMap[buildId];
    if (!build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    build.number = number;
    // await app.mysql.query(tasksConstants.UPDATE_BUILDS_NUMBER_BY_ID, [number, buildId]);
    await this.buildsRepository.save({ id: buildId, number });
  }

  // ????????????
  async executeJob(
    id,
    task,
    jobParams,
    jenkinsJobName,
    build_type,
    project_id,
  ) {
    // const { baseUrl } = await getOneJenkinsInfoBYTask(task.jenkins_id);
    const { baseUrl } = await this.jenkinsInfoService.getOneJenkinsInfoBYTask(
      task.jenkins_id,
    );

    let jenkinsBuild = null;

    if (build_type === utils.buildTypes.SERVER) {
      jenkinsBuild = await this.jenkinsInfoService.buildJobQuery(
        baseUrl,
        jenkinsJobName,
        jobParams,
      );
    } else {
      jenkinsBuild = await this.jenkinsInfoService.buildJob(
        baseUrl,
        jenkinsJobName,
        jobParams,
      );
    }

    await this.jenkinsInfoService.waitUntilJobStart(baseUrl, jenkinsBuild);

    await this.updateBuildNumber(id, jenkinsBuild.number);

    await this.jenkinsInfoService.waitUntilJobComplete(baseUrl, jenkinsBuild);

    const resultParams = {
      id,
      baseUrl,
      jenkinsBuild,
      jenkinsJobName,
      project_id,
      build_type,
    };

    // ????????????
    await this.afterFunRun(resultParams);
  }

  // ??????????????????  jb ???????????? ???????????????????????? ????????????
  async afterFunRun(resultParams) {
    // if (build_type === utils.buildTypes.CHECK) {
    //   await this.afterCheckJob(resultParams);
    // } else if (build_type === utils.buildTypes.ASSET_BUNDLE) {
    //   await this.afterAssetBundleJob(resultParams);
    // } else {
    //   await this.afterOtherJob(resultParams);
    // }
    const { PACKAGE, SERVER, TEST, EVENT, ...rest } = utils.buildTypes;
    if (Object.values(rest).includes(resultParams.build_type)) {
      await this.afterAssetBundleOrCheckJob(resultParams);
    } else {
      await this.afterOtherJob(resultParams);
    }
  }

  // ab ????????????
  async afterAssetBundleOrCheckJob({
    id,
    baseUrl,
    jenkinsBuild,
    jenkinsJobName,
    project_id,
    build_type,
  }) {
    const stages = await this.jenkinsInfoService.getStages(
      baseUrl,
      jenkinsBuild,
    );

    let wsNodeId = '';
    try {
      wsNodeId = stages.find((s) => s.name === '????????????').wsNodeId;
    } catch (error) {
      console.log(
        'wsNodeId --------error----------------------------->>',
        jenkinsBuild.number,
        error,
        jenkinsBuild.result,
        stages,
      );
    }
    const logRes = await lastValueFrom(
      this.httpService
        .get(
          `${baseUrl}/job/${jenkinsJobName}/${jenkinsBuild.number}/execution/node/${wsNodeId}/ws/log/${jenkinsJobName}_${jenkinsBuild.number}.json`,
        )
        .pipe(map((res) => res.data)),
    );
    // const reportUrl = await uploadFile(logRes.body, '.json');
    await this.updateBuildCustomData(
      id,
      JSON.stringify({
        report_url: '',
      }),
    );

    // ???????????? ??????????????????
    const filePath = await this.minioClientService.beforePutObject({
      val: logRes.body,
      projectId: project_id,
      jobName: jenkinsJobName,
      buildNumber: jenkinsBuild.number,
    });
    await this.updateBuildFilePath(id, filePath);
    await this.updateBuildStatus(
      id,
      utils.convertJenkinsStatusToInt(jenkinsBuild.result),
    );

    // ????????????build id ????????????
    if (build_type === utils.buildTypes.PACKAGE) {
      const { package_build_id } = logRes.body
        ? JSON.parse(logRes.body)
        : { package_build_id: '' };
      await this.establishConnectionBuild(package_build_id, id);
    }
  }

  // ?????????????????? ????????? ??? ????????????????????????
  async establishConnectionBuild(package_build_id, analyze_id) {
    // await app.mysql.query(tasksConstants.UPDATE_CONNECTION_BUILD_WITH_PACKAGE_ANALYZE, [package_build_id, analyze_id]);
    await this.buildsRepository.save({
      id: analyze_id,
      package_build_id,
    });
  }

  // ??????????????? ??????????????????
  // async afterCheckJob({
  //   id,
  //   baseUrl,
  //   jenkinsBuild,
  //   jenkinsJobName,
  //   project_id,
  // }) {
  //   const stages = await this.jenkinsInfoService.getStages(
  //     baseUrl,
  //     jenkinsBuild,
  //   );

  //   let wsNodeId = '';
  //   try {
  //     wsNodeId = stages.find((s) => s.name === '????????????').wsNodeId;
  //   } catch (error) {
  //     console.log(
  //       'wsNodeId --------error----------------------------->>',
  //       jenkinsBuild.number,
  //       error,
  //       jenkinsBuild.result,
  //       stages,
  //     );
  //   }
  //   const logRes = await lastValueFrom(
  //     this.httpService
  //       .get(
  //         `${baseUrl}/job/${jenkinsJobName}/${jenkinsBuild.number}/execution/node/${wsNodeId}/ws/log/${jenkinsJobName}_${jenkinsBuild.number}.json`,
  //       )
  //       .pipe(map((res) => res.data)),
  //   );
  //   // const reportUrl = await uploadFile(logRes.body, '.json');
  //   // const report = JSON.parse(logRes.body);
  //   // const isPass = !!(report && report.is_pass);
  //   await this.updateBuildCustomData(
  //     id,
  //     JSON.stringify({
  //       // report_url: reportUrl,
  //       report_url: '',
  //       is_pass: true,
  //       branches: '',
  //       hashes: '',
  //       stages: '',
  //     }),
  //   );

  //   // const project = await projectService.getOneProject(Number(project_id));
  //   // const { label } = project.data;
  //   // const filePath = `resultFile/${label}/check/${jenkinsJobName}_${jenkinsBuild.number}_${Date.now().valueOf().toString()}.json`;
  //   // await app.services.minioService.putObject({
  //   //   val: logRes.body,
  //   //   pathDir: filePath
  //   // });

  //   // ???????????? ??????????????????
  //   const filePath = await this.minioClientService.beforePutObject({
  //     val: logRes.body,
  //     projectId: project_id,
  //     jobName: jenkinsJobName,
  //     buildNumber: jenkinsBuild.number,
  //   });

  //   await this.updateBuildFilePath(id, filePath);
  //   await this.updateBuildStatus(
  //     id,
  //     utils.convertJenkinsStatusToInt(jenkinsBuild.result),
  //   );
  // }

  // ???????????????job ??????????????????
  async afterOtherJob({ id, jenkinsBuild }) {
    await this.updateBuildStatus(
      id,
      utils.convertJenkinsStatusToInt(jenkinsBuild.result),
    );
  }

  async populateBuild(build) {
    // if (this.executingBuildMap[build.id]) {
    //   build.duration = Math.ceil(
    //     (Date.now() - Number(new Date(build.created_at * 1000))) / 1000,
    //   );
    // }
    // build.progress_estimate =
    //   build.duration /
    //   this.tasksService.taskMap[build.task_id].average_duration;
    build.badges = build.badges.split(',').filter(Boolean);
    // if (build.user_id > 0) {
    //   const [users] = await app.mysql.query(usersConstants.SELECT_ONE_USER_BY_ID, [build.user_id]);
    //   delete build.user_id;
    //   build.user = users[0];
    // }
  }

  async getBuild(taskId, buildId) {
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID_AND_TASK_ID, [buildId, taskId]);
    const build = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.id = :id', { id: buildId })
      .andWhere('b.task_id = :taskId', { taskId })
      .leftJoinAndMapOne('b.user', 'users', 'u', 'u.id = b.user_id')
      .getOne();
    if (!build) {
      throw new HttpException(
        '????????????????????????',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // const build = builds[0];
    const task = this.tasksService.taskMap[taskId];
    // const { jenkinsUrl } = await getOneJenkinsInfoBYTask(task.jenkins_id);
    const { jenkinsUrl } =
      await this.jenkinsInfoService.getOneJenkinsInfoBYTask(task.jenkins_id);
    build['jenkins_url'] = jenkinsUrl;
    await this.populateBuild(build);

    return build;
  }

  async getBuilds(taskId, { page, per_page }) {
    // page = parseInt(page) || 1;
    // per_page = parseInt(per_page) || 10;
    // const task = taskMap[taskId];
    // if (!task) {
    //   return {
    //     error: app.errors.resourceNotFound
    //   };
    // }

    const builds = await this.buildsRepository
      .createQueryBuilder('b')
      .where('b.task_id = :taskId', { taskId })
      .offset(per_page * (page - 1))
      .limit(per_page)
      .leftJoinAndMapOne('b.user', 'users', 'u', 'u.id = b.user_id')
      .orderBy('b.created_at', 'DESC')
      .getMany();

    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILDS_BY_TASK_ID_ORDER_BY_CREATED_AT_LIMIT, [task.id, offset, per_page]);
    for (const build of builds) {
      await this.populateBuild(build);
    }
    return builds;
  }

  async insertBuild(userId, taskId, parameters) {
    const task = this.tasksService.taskMap[taskId];
    if (!task) {
      throw new Error(`Task '${taskId}' not found.`);
    }
    if (!task.enabled) {
      throw new Error(`Task '${taskId}' is disabled.`);
    }
    const taskExtra = this.tasksService.taskExtraMap[taskId];
    // const jobName = task.name;
    // const buildType = task.view_name;

    // app.sentry.captureMessage(
    //   `Create build '${taskId}'  ${task.project_id} ${task.name}`,
    // );
    this.sentryClient.captureMessage(
      `Create build '${taskId}'  ${task.project_id} ${task.name}`,
    );
    // const [result] = await app.mysql.query(tasksConstants.INSERT_BUILD, [task.id, userId, 0, JSON.stringify(parameters), jobName, buildType, 0, task.project_id]);
    const data = await this.buildsRepository.create({
      task_id: task.id,
      user_id: userId,
      status: 0,
      parameters: JSON.stringify(parameters),
      job_name: task.name,
      build_type: task.view_name,
      project_id: task.project_id,
    });
    const build = await this.buildsRepository.save(data);
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID, [result.insertId]);
    // const build = builds[0];
    // build["progress_estimate"] = 0;
    // build["badges"] = build.badges.split(',').filter(Boolean);
    Object.assign(build, {
      badges: build.badges.split(',').filter(Boolean),
      // progress_estimate: 0,
    });
    if (userId > 0) {
      const user = await this.usersRepository.findOne({ id: userId });
      build['user'] = user;
    }
    taskExtra.executingBuilds.push(build);
    this.executingBuildMap[build.id] = build;
    this.executingBuildExtraMap[build.id] = {
      executionMap: {},
    };
    // ??????????????????????????????????????? ???????????????updataView ???
    // for (const view of taskExtra.views) {
    //   ++view.executing_build_count;
    //   app.ci.emit('updateView', view);
    // }
    task.last_build = build;
    // app.ci.emit('createBuild', build);
    this.wsService.createBuild(build);
    return build;
  }

  async updateBuildStatus(buildId, status) {
    const build = this.executingBuildMap[buildId];
    if (!build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    const task = this.tasksService.taskMap[build.task_id];
    if (!task) {
      throw new Error(`Task '${build.task_id}' not found.`);
    }
    if (status > build.status) {
      // ?????????????????????????????????task ????????????????????????????????????   ??????????????????????????????
      build.status = status;
      // build.duration = Math.ceil(
      //   (Date.now() - Number(new Date(build.created_at * 1000))) / 1000,
      // );
      // build.progress_estimate = build.duration / task.average_duration;

      await this.buildsRepository.save({
        id: buildId,
        status,
        // duration: build.duration,
      });

      // if (status > 1) {
      // ??????build ????????????????????????????????? ???????????????????????????????????????????????????created_at ?????? ??? updated_at ???????????????????????????
      // await app.mysql.query(tasksConstants.UPDATE_BUILDS_STATUS_AND_DURATION_BY_ID, [status, build.duration, buildId]);
      // await this.buildsRepository.save({
      // id: buildId,
      // status,
      // duration: build.duration,
      // });
      // if (status === 2) {
      //   task.average_success_rate = Math.min(
      //     1,
      //     task.average_success_rate * 0.8 + 0.2,
      //   );
      //   task.average_duration = Math.ceil(
      //     task.average_duration * 0.8 + build.duration * 0.2,
      //   );
      // } else if (status === 3) {
      //   task.average_success_rate = task.average_success_rate * 0.8;
      // }
      // await app.mysql.query(tasksConstants.UPDATE_TASK_AVERAGE_DURATION_AND_AVERAGE_SUCCESS_RATE, [task.average_duration, task.average_success_rate, task.id]);
      // await this.tasksRepository.save({
      // id: task.id,
      // average_duration: task.average_duration,
      // average_success_rate: task.average_success_rate,
      // });
      // app.ci.emit('buildEnd', build, task);
      // doBuildFinish(build);
      // } else {
      // await app.mysql.query(tasksConstants.UPDATE_BUILDS_STATUS_BY_ID, [status, build.id]);
      // await this.buildsRepository.save({ id: buildId, status });
      // }
      // app.ci.emit('updateBuild', build);
      this.wsService.updateBuild(build);
    }
  }

  // ??????ab ????????????
  async beforeAssetBundleJob(build) {
    const { parameters, id, job_name, task_id, build_type, project_id } = build;
    const project = await this.projectsService.getOneProject(project_id);
    const { label } = project;
    const task = this.tasksService.taskMap[task_id];
    // ????????????uid
    parameters['project_uid'] = label;

    const jobParams = {
      context: JSON.stringify(parameters),
    };

    await this.executeJob(
      id,
      task,
      jobParams,
      job_name,
      build_type,
      project_id,
    );
  }

  // ??????server ???????????????
  testParamters(parameters) {
    if (!parameters) return '';
    let params = [];
    Object.keys(parameters).forEach((key) => {
      if (
        Object.prototype.toString.call(parameters[key]) === '[object Array]'
      ) {
        const res = parameters[key].map((item) => `${key}=${item}`);
        params = [...params, ...res];
      } else {
        params.push(`${key}=${parameters[key]}`);
      }
    });

    const quires = `?${params.join('&')}`;

    return quires;
  }

  // server ?????????job????????????
  async beforeServerJob(build) {
    const { task_id, build_type, id, parameters, job_name, project_id } = build;
    const task = this.tasksService.taskMap[task_id];
    if (parameters && parameters.branch) {
      await this.addBuildBadge(build.id, parameters.branch);
    }
    parameters['project_id'] = project_id;

    const quires = await this.testParamters(parameters);

    await this.executeJob(id, task, quires, job_name, build_type, project_id);
  }

  // before Other ?????????job ????????????
  async beforeOtherJob(build) {
    const { task_id, build_type, id, parameters, job_name, project_id } = build;
    const task = this.tasksService.taskMap[task_id];
    if (parameters && parameters.branch) {
      await this.addBuildBadge(build.id, parameters.branch);
    }
    parameters['project_id'] = project_id;

    await this.executeJob(
      id,
      task,
      parameters,
      job_name,
      build_type,
      project_id,
    );
  }

  async findBuild(buildId) {
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID, [buildId]);
    const build = await this.buildsRepository.findOne({ id: buildId });
    if (build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    // const build = builds[0];
    const task = this.tasksService.taskMap[build.task_id];
    if (!task) {
      throw new Error(`Task '${build.task_id}' not found.`);
    }
    await this.populateBuild(build);
    return build;
  }

  async doBuildFinish(buildId) {
    const buildData = await this.findBuild(buildId);
    // app.ci.emit('BUILD_END', buildData);
    this.pipelinesService.buildEnd(buildData);
    // ?????????????????????pipeline ??? buildEnd??????
  }

  async startBuild(buildId) {
    const build = this.executingBuildMap[buildId];
    if (!build) {
      throw new Error(`Build '${buildId}' not found.`);
    }
    if (build.status !== 0) {
      throw new Error(`Build '${buildId}' alread started.`);
    }
    const task = this.tasksService.taskMap[build.task_id];
    if (!task) {
      throw new Error(`Task '${build.task_id}' not found.`);
    }
    // const taskExtra = taskExtraMap[build.task_id];
    // const finished = false;
    try {
      await this.updateBuildStatus(buildId, 1);

      // ?????????????????????????????????????????????????????????????????? ???????????????????????????????????????????????????????????????
      // const updateBuild = async () => {
      //   build.duration = Math.ceil(
      //     (Date.now() - Number(new Date(build.created_at * 1000))) / 1000,
      //   );
      //   build.progress_estimate = build.duration / task.average_duration;
      //   // app.ci.emit('updateBuild', build);
      //   this.wsService.updateBuild(build);
      //   if (!finished) {
      //     setTimeout(updateBuild, 5000);
      //   }
      // };
      // setTimeout(updateBuild, 5000);

      // ??????jenkins

      // ?????????????????? ??? ab?????? ??????????????????jk ??????????????????????????????????????????????????????????????????????????? ??? ?????? ????????????
      // if ([CHECK, ASSET_BUNDLE].includes(build.build_type)) {
      //   await beforeCheckJob(build);
      // } else {
      //   await executeOtherJob(build);
      // }

      switch (build.build_type) {
        case utils.buildTypes.CHECK:
          await this.beforeCheckJob(build);
          break;
        case utils.buildTypes.ASSET_BUNDLE:
          await this.beforeAssetBundleJob(build);
          break;
        case utils.buildTypes.SERVER:
          await this.beforeServerJob(build);
          break;
        case utils.buildTypes.PACKAGE || utils.buildTypes.TEST:
          await this.beforeOtherJob(build);
          break;
        default:
          await this.beforeOtherJob(build);
          break;
      }
    } catch (err) {
      // buildLog(buildId, err.stack);
      // try {
      await this.updateBuildStatus(buildId, 3);
      // } catch (err) {
      // buildLog(buildId, err.stack);
      // }
    }

    // finally {
    //   finished = true;
    // }

    // ?????????????????????????????????????????????updateView
    // const index = taskExtra.executingBuilds.indexOf(build);
    // if (index >= 0) {
    //   taskExtra.executingBuilds.splice(index, 1);
    //   for (const view of taskExtra.views) {
    //     --view.executing_build_count;
    //     app.ci.emit('updateView', view);
    //   }
    // }

    // ????????????????????????
    delete this.executingBuildMap[buildId];
    delete this.executingBuildExtraMap[buildId];
    // ??????????????????
    this.doBuildFinish(buildId);
  }

  async createBuild(taskId, parameters, userId) {
    // const task = taskMap[taskId];
    // if (!task) {
    //   return {
    //     error: app.errors.resourceNotFound
    //   };
    // }

    // if (!task.enabled) {
    //   return {
    //     error: app.errors.taskDisabled
    //   };
    // }
    const build = await this.insertBuild(userId, taskId, parameters);
    this.startBuild(build.id);

    return build;
  }

  // ???????????????????????????????????????????????????
  async getTaskBuilds(taskId, { page, per_page }) {
    // page = parseInt(page) || 1;
    // per_page = parseInt(per_page) || 10;
    // const offset = Math.max(0, page - 1) * per_page;
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILDS_BY_TASK_ID_LIMIT, [taskId, offset, per_page]);
    // const [counts] = await app.mysql.query(tasksConstants.SELECT_BUILDS_COUNT_BY_TASK_ID, [taskId]);
    // const buildCount = counts[0].count;
    const [builds, total] = await this.buildsRepository.findAndCount({
      where: {
        task_id: taskId,
      },
      order: {
        created_at: 'DESC',
      },
      take: per_page,
      skip: (page - 1) * per_page,
    });
    for (const build of builds) {
      await this.populateBuild(build);
    }
    return {
      builds,
      total,
    };
  }

  async startTask(taskEven) {
    try {
      const taksData = taskEven.taksData;
      const userId = taskEven.userId;

      const data = await this.createBuild(
        taksData.id,
        taksData.parameters,
        userId,
      );
      return data;
    } catch (error) {
      return {};
    }
  }

  async getBuildCustomData(build_id) {
    // const [builds] = await app.mysql.query(tasksConstants.SELECT_BUILD_BY_ID, [build_id]);
    const { file_path } = await this.buildsRepository.findOne({
      where: { id: build_id },
    });
    // const build = builds[0];
    // const { custom_data } = build;
    // const { file_path } = builds[0];
    // const customData = custom_data ? JSON.parse(custom_data) : null;
    let report = null;
    if (file_path) {
      try {
        // report = JSON.parse(await readFile(customData.report_url));
        report = await this.minioClientService.getObject(file_path);
      } catch (error) {
        report = null;
      }
    }
    return report;
  }
}
