import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PipelinesEntity } from 'src/entities';
import { In, Like, Repository } from 'typeorm';
import objectPath from 'object-path';
import moment from 'moment';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/index.dto';
import { PipelinesRecordsService } from '../pipelines-records/pipelines-records.service';
import { JenkinsInfoService } from 'src/modules/jenkins-info/jenkins-info.service';
// import { got } from 'got';
import { BuildsService } from 'src/modules/builds/builds.service';
import * as utils from 'src/utils/index.utils';
import { WsService } from 'src/modules/websocket/ws.service';
import { NotifyService } from 'src/modules/notify/notify.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class PipelinesService implements OnModuleInit {
  public sentryClient: any;

  // @Inject()
  // schedulerRegistry: SchedulerRegistry;

  constructor(
    @Inject(forwardRef(() => PipelinesRecordsService))
    private pipelinesRecordsService: PipelinesRecordsService,

    @Inject(forwardRef(() => BuildsService))
    private readonly buildsService: BuildsService,
    private readonly jenkinsInfoService: JenkinsInfoService,
    private readonly wsService: WsService,
    private readonly notifyService: NotifyService,
    private schedulerRegistry: SchedulerRegistry,
    @InjectSentry() private readonly sentryService: SentryService, // private httpService: HttpService,
    private httpService: HttpService,
  ) {
    this.sentryClient = this.sentryService.instance();
  }

  @InjectRepository(PipelinesEntity)
  private pipelinesRepository: Repository<PipelinesEntity>;

  public pipelinesData = {};
  public executeNodes = {};
  public schedules = {};

  // ????????????
  public TRIGER_TYPE = {
    EVERY: 1,
    WORK_DAY: 2,
    NO_REPEAT: 3,
    WEEK_DAY: 4,
  };

  onModuleInit() {
    this.initSchedule();
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

  // ????????????
  async notifyUser({ type, tousers, content }) {
    this.notifyService.notify({
      type,
      tousers,
      message: {
        msgtype: 'markdown',
        content,
      },
    });
  }

  // ??????????????????????????????
  async beforeNodeToUser(piplineData, node, status) {
    // try {
    const exg = new RegExp(/\${.*?\}/g);
    const msgs = node.data.extra.message.match(exg);
    let message = node.data.extra.message;
    if (msgs) {
      await utils.sleep(10 * 1000);
      // res ???eval ???????????????????????? ??????????????????
      const res = await this.buildsService.getBuildCustomData(
        node.data.build.buildId,
      );

      msgs.forEach((msg) => {
        const element = msg.slice(2, -1);
        if (element) {
          const val = objectPath.get(res.data, element, msg);
          message = message.replace(msg, val);
        }
      });
    }
    this.notifyUser({
      type: 'weixin',
      tousers: node.data.extra.users.join('|'),
      content:
        `?????????${piplineData.data.name}` +
        '\n' +
        `?????????${node.data.display_name}` +
        '\n' +
        `?????????${status === 2 ? '??????' : '??????'}` +
        '\n' +
        `?????????${message}` +
        '\n' +
        `?????????[DevOps ??????](https://devops.sofunny.io/taskPipeline/records/${piplineData.pipeline_record_id})`,
    });

    // } catch (error) {
    //   console.log('node notify', error);
    // }
  }

  // ???????????????????????????????????????2?????????????????????????????????????????????
  piplineIsEnd(exNode) {
    let nodes = [exNode];
    while (nodes.length) {
      const node = nodes.shift();
      if (node.status !== -1 && node.status < 2) {
        return false;
      }
      if (node.childs.length !== 0) {
        nodes = [...nodes, ...node.childs];
      }
    }

    return true;
  }

  // ?????????????????????
  getPipelineEndState(startNode) {
    let nodes = [startNode];
    while (nodes.length) {
      const node = nodes.shift();
      if (node.status > 2) {
        return node.status;
      }
      if (node.childs.length !== 0) {
        nodes = [...nodes, ...node.childs];
      }
    }

    return 2;
  }

  // ????????????????????????????????????????????? ????????????
  getPipelineFailAndSuc(startNode) {
    let nodes = [startNode];
    const nodeIds = [];
    const result = {
      passCount: 0,
      failCount: 0,
      duration: 0,
    };
    while (nodes.length) {
      const node = nodes.shift();
      if (node.status > 2) {
        result.failCount += 1;
      }
      if (
        node.node.shape !== 'start-node' &&
        node.status === 2 &&
        !nodeIds.includes(node.node.id)
      ) {
        nodeIds.push(node.node.id);
        result.passCount += 1;
      }
      if (
        node.node.shape !== 'start-node' &&
        this.executeNodes[node.build_id + '']
      ) {
        const execuNode = this.executeNodes[node.build_id + ''];
        result.duration += Number(execuNode.node.data.build.duration);
      }
      if (node.childs.length !== 0) {
        nodes = [...nodes, ...node.childs];
      }
    }

    return result;
  }

  clearExNodes(startNode) {
    const build_id = startNode.build_id;
    const key = build_id + '';
    const childs = startNode.childs;
    for (let index = 0; index < childs.length; index++) {
      const element = childs[index];
      this.clearExNodes(element);
    }
    delete this.executeNodes[key];
  }

  //????????????????????????
  async buildEnd(eventData) {
    // app.sentry.captureMessage(`???????????? ${eventData.id}`, {
    //   level: 'info',
    //   contexts: eventData
    // });
    this.sentryClient.captureMessage(`???????????? ${eventData.id}`, {
      contexts: eventData,
    });
    //?????????????????????????????????
    const build_id = eventData.id;
    const executeNode = this.executeNodes[build_id + ''];
    if (!executeNode) {
      return;
    }

    //??????????????????
    const status = eventData.status;

    executeNode.status = status;
    const node = executeNode.node;
    //???????????????????????????????????????????????????
    node.data.build = {
      buildId: eventData.id,
      state: status,
      type: eventData.build_type,
      duration: eventData.duration,
    };

    //?????????????????????????????????id????????????????????????
    const p_record_id = executeNode.pipline_record_id;
    const piplineData = this.pipelinesData[p_record_id + ''];
    // app.sentry.captureMessage(`builEnd: ${build_id}`, {
    //   level: 'info',
    //   contexts: eventData
    // });
    this.sentryClient.captureMessage(`builEnd: ${build_id}`, {
      contexts: eventData,
    });
    // ?????????????????????????????????????????????????????????????????????????????????
    if (status === 2) {
      this.startExecuteNode(executeNode, piplineData.userId);
    } else if (status > 2) {
      // app.sentry.captureMessage(`??????????????????: ${p_record_id}`, {
      //   level: 'info',
      //   contexts: executeNode
      // });
      this.sentryClient.captureMessage(`builEnd: ${build_id}`, {
        contexts: executeNode,
      });
      // ????????????????????????????????????????????????????????????5 ??????????????????????????????
      this.setFailurChildNotAllow(executeNode);
    }

    // ????????????????????????????????????????????????????????????????????????
    if (
      node &&
      node.data &&
      node.data.extra &&
      node.data.extra.isNotify &&
      node.data.extra.users
    ) {
      // ????????????
      this.beforeNodeToUser(piplineData, node, status);
    }

    const isEnd = this.piplineIsEnd(piplineData.startNode);

    if (isEnd) {
      piplineData.data.status = this.getPipelineEndState(piplineData.startNode);

      const { passCount, failCount, duration } = this.getPipelineFailAndSuc(
        piplineData.startNode,
      );
      piplineData.data.duration = duration;
      if (piplineData.data.notify_enable && piplineData.data.notify_users) {
        this.notifyUser({
          type: 'weixin',
          tousers: piplineData.data.notify_users.split(',').join('|'),
          content:
            `?????????${piplineData.data.name}` +
            '\n' +
            `?????????${passCount}` +
            '\n' +
            `?????????${failCount}` +
            '\n' +
            `?????????${utils.parseDuration(duration)}` +
            '\n' +
            `?????????[DevOps ??????](http://devops.wll/taskPipeline/records/${piplineData.pipeline_record_id})`,
        });
      }
      // app.sentry.captureMessage(`isEnd: ${p_record_id}`, {
      //   level: 'info',
      //   contexts: piplineData,
      // });
      this.sentryClient.captureMessage(`builEnd: ${build_id}`, {
        contexts: piplineData,
      });
    }
    this.upPipline(piplineData.data);

    if (isEnd) {
      this.clearExNodes(piplineData.startNode);
      const key = p_record_id + '';
      delete this.pipelinesData[key];
    }
  }

  setFailurChildNotAllow(executeNode) {
    if (executeNode.childs.length !== 0) {
      for (let i = 0; i < executeNode.childs.length; i++) {
        executeNode.childs[i].status = -1;
        this.setFailurChildNotAllow(executeNode.childs[i]);
      }
    }
  }

  // ??????????????????????????????????????????????????????????????? ?????????????????????????????????
  async initSchedule() {
    const res = await this.getAllPipelines();
    if (res.length !== 0) {
      res.forEach((item) => {
        if (item.schedule_time) {
          this.schedule(item);
        }
      });
    }
  }

  cancelSchedule(id) {
    try {
      const events = this.schedules[id];

      if (events.length !== 0) {
        events.forEach((event, index) => {
          const cronJob = this.schedulerRegistry.getCronJob(`${id}_${index}`);
          if (cronJob) {
            this.schedulerRegistry.deleteCronJob(`${id}_${index}`);
          }
        });
      }

      delete this.schedules[id];
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ????????????????????????
  schedule(row) {
    const { id, created_user, timing } = row;

    const scheduleEvents = [];

    timing.forEach((item, index) => {
      const { schedule_time, triger_type, week_day } = item;
      const scheduleEvents = [];

      const moment_data = moment(schedule_time, 'YYYY-MM-DD HH:mm:ss');
      const second = moment_data.seconds();
      const minute = moment_data.minutes();
      const hour = moment_data.hours();
      const year = moment_data.year();
      const month = moment_data.month();
      const date = moment_data.date();

      let scheduleTime = '';
      // ?????????????????? ???????????????
      if (triger_type === this.TRIGER_TYPE.NO_REPEAT) {
        const pipelint_time = new Date(schedule_time).getTime();
        // ????????????
        if (pipelint_time < new Date().getTime()) {
          return;
        }
        scheduleTime = `${second} ${minute} ${hour} ${date} ${month} ? ${year}`;
      }

      if (triger_type === this.TRIGER_TYPE.WEEK_DAY) {
        scheduleTime = `${second} ${minute} ${hour} ? * ${week_day}`;
      }

      // ?????????????????????
      if (triger_type === this.TRIGER_TYPE.WORK_DAY) {
        //  ????????????????????? ????????????
        scheduleTime = `${second} ${minute} ${hour} ? * MON-FRI`;
      }

      // ??????????????????
      if (triger_type === this.TRIGER_TYPE.EVERY) {
        scheduleTime = `${second} ${minute} ${hour} ? * *`;
      }

      const cornJob = new CronJob({
        cronTime: scheduleTime,
        onTick: () => {
          this.execute(id, created_user);
        },
      });

      this.schedulerRegistry.addCronJob(`${id}_${index}`, cornJob);

      scheduleEvents.push(cornJob);
    });

    this.schedules[id] = scheduleEvents;
  }

  // ????????????????????????
  // schedule(row) {

  //   const { id, created_user, timing } = row;

  //   const scheduleEvents = [];

  //   const moment_data = moment(schedule_time, 'YYYY-MM-DD HH:mm:ss');
  //   const second = moment_data.seconds();
  //   const minute = moment_data.minutes();
  //   const hour = moment_data.hours();
  //   const year = moment_data.year();
  //   const month = moment_data.month();
  //   const date = moment_data.date();
  //   // const schedule_obj = {
  //   //   hour,
  //   //   second,
  //   //   minute,
  //   // };
  //   let scheduleTime = '';
  //   // ?????????????????? ???????????????
  //   if (triger_type === this.TRIGER_TYPE.NO_REPEAT) {
  //     // Object.assign(schedule_obj, {
  //     //   year: moment_data.year(),
  //     //   month: moment_data.month(),
  //     //   date: moment_data.date(),
  //     // });
  //     // schedule_obj.year = moment_data.year();
  //     // schedule_obj.month = moment_data.month();
  //     // schedule_obj.date = moment_data.date();
  //     const pipelint_time = new Date(schedule_time).getTime();
  //     // ????????????
  //     if (pipelint_time < new Date().getTime()) {
  //       return;
  //     }
  //     scheduleTime = `${second} ${minute} ${hour} ${date} ${month} ? ${year}`;
  //   }

  //   // ??????????????????
  //   if (triger_type === this.TRIGER_TYPE.WEEK_DAY) {
  //     // schedule_obj.dayOfWeek = week_day;
  //     //
  //     scheduleTime = `${second} ${minute} ${hour} ? * ${week_day}`;
  //   }

  //   // ?????????????????????
  //   if (triger_type === this.TRIGER_TYPE.WORK_DAY) {
  //     //  ????????????????????? ????????????
  //     scheduleTime = `${second} ${minute} ${hour} ? * MON-FRI`;
  //   }

  //   // ??????????????????
  //   if (triger_type === this.TRIGER_TYPE.EVERY) {
  //     // schedule_obj.dayOfMonth = date;
  //     scheduleTime = `${second} ${minute} ${hour} ? * *`;
  //   }

  //   if (!scheduleTime) return;

  //   const cornJob = new CronJob({
  //     cronTime: scheduleTime,
  //     onTick: () => {
  //       this.execute(id, created_user);
  //     },
  //   });

  //   this.schedulerRegistry.addCronJob(id, cornJob);

  // const scheduleEvent = scheduler.scheduleJob(schedule_obj, () => {
  //   // ????????????????????????
  //   if (triger_type === this.TRIGER_TYPE.WORK_DAY) {
  //     const cur_day = new Date().getDay();
  //     if (cur_day === 0 || cur_day === 6) {
  //       return;
  //     }
  //   }

  //   // if (triger_type === TRIGER_TYPE.WEEK_DAY) {
  //   //   //  ?????????????????? ?????? ??????  ????????????
  //   //   const cur_day = new Date().getDay();
  //   //   if (week_day !== cur_day) {
  //   //     return;
  //   //   }
  //   // }
  //   this.execute(id, created_user.id);
  //   // ????????? ????????????????????????
  //   if (triger_type === this.TRIGER_TYPE.NO_REPEAT) {
  //     const event = this.schedules[id];
  //     event.cancel();
  //     delete this.schedules[id];
  //     return;
  //   }
  // });

  // this.schedules[id] = scheduleEvent;
  // }

  // ??????????????????
  async getPipelineList({ project_id }, { page, size, ...rest }) {
    const params = this.dealWithQuery(rest);

    const [data, total] = await this.pipelinesRepository
      .createQueryBuilder('p')
      .where('p.project_id = :project_id', { project_id })
      .andWhere(params)
      .leftJoinAndMapOne(
        'p.created_user',
        'users',
        'u',
        'u.id = p.created_user',
      )
      .leftJoinAndMapOne(
        'p.latest_record',
        'pipelines_records',
        'pr',
        'pr.id = p.latest_record',
      )
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * size || 0)
      .take(size || 10)
      .getManyAndCount();

    return {
      data,
      total,
    };
  }

  // ??????id ????????????pipeline ??????
  async getOnePipeline(id) {
    const pipeline = await this.pipelinesRepository
      .createQueryBuilder('p')
      .where('p.id = :id', { id })
      .leftJoinAndMapOne(
        'p.created_user',
        'users',
        'u',
        'u.id = p.created_user',
      )
      .getOne();
    return pipeline;
  }

  async getAllPipelines() {
    try {
      const pipelines = await this.pipelinesRepository
        .createQueryBuilder('p')
        .leftJoinAndMapOne(
          'p.created_user',
          'users',
          'u',
          'u.id = p.created_user',
        )
        .getMany();
      return pipelines;
    } catch (error) {
      return [];
    }
  }

  //{ name, owner_users, schedule_time, notify_enable, notify_users, triger_type, document_url, description, week_day }

  async insertPipeline({ user_id, project_id }, createPipelineDto) {
    try {
      const pipe = await this.pipelinesRepository.create({
        user_id,
        project_id,
        ...createPipelineDto,
      });
      const data = await this.pipelinesRepository.save(pipe);
      if (data['schedule_time']) {
        this.schedule(data);
      }
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // { name, owner_users, schedule_time, notify_enable, notify_users, triger_type, create_user, document_url, description, week_day }
  async updatePipeline(id, updatePipelineDto) {
    try {
      const info = await this.pipelinesRepository.save({
        id,
        ...updatePipelineDto,
      });

      // const info = await getOnePipeline(id);
      // ??????????????????????????? ?????????????????????
      // if (this.schedules[info.data.id]) {
      //   const event = this.schedules[info.data.id];
      //   event.cancel();
      //   delete this.schedules[id];
      // }
      if (this.schedule[id]) {
        this.cancelSchedule(id);
      }

      // const cronJob = this.schedulerRegistry.getCronJob(id);
      // if (cronJob) {
      //   this.schedulerRegistry.deleteCronJob(id);
      // }
      //  ????????????????????? ???????????????
      if (info?.timing && info?.timing?.length !== 0) {
        this.schedule(info);
      }
      return info;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePipelineNotifyEnable(id, { notify_enable }) {
    try {
      const data = await this.pipelinesRepository.save({ id, notify_enable });
      return data;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updatePipelineConfig(id, { nodes, edges }) {
    try {
      const data = await this.pipelinesRepository.save({ id, nodes, edges });
      return data;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePipeline(id) {
    try {
      await this.pipelinesRepository.delete(id);
      // if (this.schedules[id]) {
      //   const event = this.schedules[id];
      //   event.cancel();
      //   delete this.schedules[id];
      // }
      if (this.schedule[id]) {
        this.cancelSchedule(id);
      }
      // const cronJob = this.schedulerRegistry.getCronJob(id);
      // if (cronJob) {
      //   this.schedulerRegistry.deleteCronJob(id);
      // }
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async copyOnePipeline({ user_id }, pid) {
    try {
      const { id, ...rest } = await this.pipelinesRepository.findOne(pid);
      const pipe = await this.pipelinesRepository.create({
        ...rest,
        created_user: user_id,
      });
      const pipeline = await this.pipelinesRepository.save(pipe);

      const info = await this.getOnePipeline(pipeline.id);
      // ??????????????????????????? ?????????????????????
      // if (this.schedules[info.data.id]) {
      //   const event = this.schedules[info.data.id];
      //   event.cancel();
      //   delete this.schedules[pid];
      // }
      if (this.schedule[pipeline.id]) {
        this.cancelSchedule(pipeline.id);
      }
      // const cronJob = this.schedulerRegistry.getCronJob(`${pipeline.id}`);
      // if (cronJob) {
      //   this.schedulerRegistry.deleteCronJob(`${pipeline.id}`);
      // }
      //  ????????????????????? ???????????????
      if (info?.timing && info?.timing?.length !== 0) {
        this.schedule(info);
      }
      return info;
    } catch (error) {
      throw error;
    }
  }

  async getJobApiJson(baseUrl, jobName) {
    const replaceJobName = jobName.replaceAll('/', '/job/');
    const res = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${replaceJobName}/api/json`)
        .pipe(map((res) => res.data)),
    );
    return res ? res.body : '';
  }

  // ??????type
  setParamterItemType(definition) {
    const result = {
      type: 'String',
    };
    if (!definition.name || !definition.type) return result;

    const type = definition.type.toLowerCase();

    if (type.includes('choice')) {
      if (definition && definition.choices && definition.choices.length !== 0) {
        return {
          type: 'Choice',
          choices: definition.choices,
        };
      }
    }
    if (type.includes('text'))
      return {
        type: 'TextArea',
      };
    if (type.includes('boolean'))
      return {
        type: 'Boolean',
      };

    if (type.includes('checkbox')) {
      const value = definition.defaultParameterValue.value;
      return {
        type: 'Checkbox',
        default_value:
          Object.prototype.toString.call(value) === '[object Array]'
            ? value
            : [value],
      };
    }

    return result;
  }

  async getParameters({ jenkins_id, job_name }) {
    const paramters = [];
    try {
      // const { baseUrl } = await getOneJenkinsInfoBYTask(jenkins_id);
      const { baseUrl } = await this.jenkinsInfoService.getOneJenkinsInfoBYTask(
        jenkins_id,
      );
      const res = await this.getJobApiJson(baseUrl, job_name);
      const result = JSON.parse(res);
      const { property } = result;
      const items = property.find(
        (item) => item._class === 'hudson.model.ParametersDefinitionProperty',
      );
      const { parameterDefinitions } = items;
      parameterDefinitions.forEach((item) => {
        if (item.name) {
          const extra = this.setParamterItemType(item);
          const element = {
            name: item.name,
            default_value: item.defaultParameterValue.value,
            description: item.description,
            ...extra,
          };

          paramters.push(element);
        }
      });
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      return {
        data: paramters,
      };
    }

    return paramters;
  }

  upPipline(piplineData) {
    // ????????????????????????
    // app.sentry.captureMessage(`upPipline ${piplineData.id}`, {
    //   level: 'info',
    //   contexts: {
    //     record_id: piplineData.id,
    //     nodes: piplineData.nodes,
    //     status: piplineData.status,
    //     duration: piplineData.duration,
    //   },
    // });
    this.pipelinesRecordsService.updatePipelineRecord({
      record_id: piplineData.id,
      nodes: piplineData.nodes,
      status: piplineData.status,
      duration: piplineData.duration,
    });
    // app.ci.emit('updateExecutePipline', piplineData);
    this.wsService.updateExecutePipeline(piplineData);
  }

  // ???????????????????????????????????????
  async setNodeStartState(build_id) {
    const executeNode = this.executeNodes[build_id + ''];
    if (!executeNode) {
      return;
    }
    //??????????????????
    executeNode.status = 1;
    const node = executeNode.node;
    //???????????????????????????????????????????????????
    node.data.build = {
      state: 1,
    };
    const p_record_id = executeNode.pipline_record_id;
    const piplineData = this.pipelinesData[p_record_id + ''];
    piplineData.data.status = 1;
    this.upPipline(piplineData.data);
  }

  getParentsNode(nodes, id) {
    let parNodes = [nodes];
    while (parNodes.length) {
      const node = parNodes.shift();
      if (node.node.id === id) {
        return node;
      }
      parNodes = [...parNodes, ...node.parents];
    }

    return null;
  }

  // ????????????
  async overrideParamters(mantle, nodes) {
    try {
      const params = {};
      const resultData = {};
      for (let i = 0; i < mantle.length; i++) {
        const element = mantle[i];
        let val = '';
        const node = await this.getParentsNode(nodes, element.parent_node);
        if (element.type === 1) {
          val = node.node.data.parameters[element.parent_key];
        } else {
          if (!resultData[node.build_id]) {
            await utils.sleep(10 * 1000);
            const res = await this.buildsService.getBuildCustomData(
              node.build_id,
            );

            // app.sentry.captureMessage(`resultFile: ${node.build_id}`, {
            //   level: 'info',
            //   contexts: res.data,
            // });
            this.sentryClient.captureMessage(`resultFile: ${node.build_id}`, {
              level: 'info',
              contexts: res.data,
            });
            resultData[node.build_id] = res;
          }
          val = objectPath.get(
            resultData[node.build_id],
            element.parent_key,
            null,
          );
        }

        params[element.node_key] = val;
      }

      return params;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      return {};
    }
  }

  //??????????????????
  async startTask(executeNode, user_id) {
    try {
      await utils.sleep(120000 * executeNode.index);
      const taksData = executeNode.node.data;

      // ?????????????????????????????????????????? ?????????????????????
      if (taksData && taksData.build && taksData.build.state > 0) {
        return;
      }

      // const buildData = await this.buildsService.startTask({
      //   taksData: taksData,
      //   userId: user_id,
      // });
      const buildData = { data: '' };
      const build_id = buildData?.['id'];
      // app.sentry.captureMessage(`startTask: ${build_id}`, {
      //   level: 'info',
      //   contexts: buildData.data
      // });
      this.sentryClient.captureMessage(`startTask: ${build_id}`, {
        level: 'info',
        contexts: buildData,
      });

      executeNode.build_id = build_id;
      this.executeNodes[build_id + ''] = executeNode;
      // ???????????? ?????????????????????????????? ????????????????????????????????????????????????????????????
      this.setNodeStartState(build_id);
    } catch (err) {
      // app.sentry.captureException(err);
      this.sentryClient.captureException(err);
      executeNode.status = 3;
    }
  }

  /**
   * ??????????????????
   * ????????????????????????????????????
   * ??????????????????????????????????????????
   * ??????????????????????????????????????????
   * ??????jk job ????????????????????? ???????????????????????????job ???????????????????????????????????????????????????????????????????????????pending???????????????????????????????????????????????????????????????????????????
   * **/
  async startExecuteNode(executeNode, user_id) {
    if (executeNode.status === 1) {
      return;
    }
    if (executeNode.status === 0) {
      this.startTask(executeNode, user_id);
    } else if (executeNode.status === 2) {
      const childs = executeNode.childs;

      for (let index = 0; index < childs.length; index++) {
        const element = childs[index];
        const allParentsSuccess = element.parents.every(
          (item) => item.status === 2,
        );
        if (element.status === 0 && allParentsSuccess) {
          element.index = index;
          const { mantle } = element.node.data;
          if (mantle && mantle.length !== 0) {
            const parames = await this.overrideParamters(mantle, element);
            Object.assign(element.node.data.parameters, parames);
            // app.sentry.captureMessage(`overrideParamters: ${element.node.data.display_name}`, {
            //   level: 'info',
            //   contexts: parames
            // });
            this.sentryClient.captureMessage(
              `overrideParamters: ${element.node.data.display_name}`,
              {
                level: 'info',
                contexts: parames,
              },
            );
          }

          // ???????????????????????????
          this.startTask(element, user_id);
        }
      }
    }
  }

  //?????????????????????????????????????????????
  createExecuteNode(node) {
    const executeNode = {
      parents: [], //?????????
      node: node, // ????????????
      childs: [], //????????? ExecuteNode
      build_id: 0, //??????????????????????????????id
      status: 0, //??????????????????
      pipline_record_id: 0, //?????????????????????
      index: 0,
    };
    return executeNode;
  }

  //?????????????????????
  getNodeTree(startNode, nodes, edges, pipline_record_id, cacheNodes) {
    const id = startNode.node.id;
    for (let index = 0; index < edges.length; index++) {
      const element = edges[index];
      // ????????????id ??????????????????ID ?????????????????????target cell ??????????????????  startNode ????????????
      if (element.source.cell === id) {
        // ??????????????? ????????????????????????????????????????????????
        // const child = getNodeById(nodes, element.target.cell);
        let childNode = null;
        if (cacheNodes[element.target.cell]) {
          childNode = cacheNodes[element.target.cell];
        } else {
          const child = nodes.find((item) => item.id === element.target.cell);
          childNode = this.createExecuteNode(child);
          childNode.pipline_record_id = pipline_record_id;
        }

        childNode.parents.push(startNode);
        cacheNodes[element.target.cell] = childNode;

        // ????????????push ?????????????????????push
        const hasPushed = startNode.childs.some(
          (item) => item.node.id === childNode.node.id,
        );
        if (!hasPushed) {
          startNode.childs.push(childNode);
        }
        this.getNodeTree(
          childNode,
          nodes,
          edges,
          pipline_record_id,
          cacheNodes,
        );
      }
    }
  }

  // ??????????????????????????????
  dealWithBeforeExcute(record, userId) {
    try {
      //????????????????????????????????? web ?????????????????????
      const record_data = record;
      const nodes = JSON.parse(record_data.nodes);
      record_data.nodes = nodes;

      //?????????????????????
      const edges = JSON.parse(record_data.edges); // ??????????????????
      record_data.edges = edges;

      //???????????????????????????????????????
      // const startNode = getNodeByShape(nodes, 'start-node'); //??????????????????
      const startNode = nodes.find((item) => item.shape === 'start-node');
      const startNodeData = this.createExecuteNode(startNode); // ????????????????????????????????????????????????
      const pipline_record_id = record_data.id;
      startNodeData.pipline_record_id = pipline_record_id;
      startNodeData.status = 2; //??????????????????????????????

      const cacheNodes = {};
      this.getNodeTree(
        startNodeData,
        nodes,
        edges,
        pipline_record_id,
        cacheNodes,
      );

      this.pipelinesData[pipline_record_id] = {
        pipeline_record_id: pipline_record_id,
        data: record_data,
        startNode: startNodeData,
        userId: userId,
      };
      return startNodeData;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      return {};
    }
  }

  //????????????
  async execute(id, userId) {
    //??????????????????
    const pipline = await this.getOnePipeline(id);
    const pipdata = pipline;
    const pipeline_id = pipdata.id;
    const record = await this.pipelinesRecordsService.insertPipelineRecord(
      {
        project_id: pipdata.project_id,
      },
      {
        pipeline_id: pipeline_id,
        name: pipdata.name,
        nodes: pipdata.nodes,
        created_user: userId,
        edges: pipdata.edges,
        // userId: userId,
        notify_enable: pipdata.notify_enable,
        notify_users: pipdata.notify_users,
        document_url: pipdata.document_url,
        description: pipdata.description,
      },
    );

    // app.sentry.captureMessage(`pipelineService.execute: ${record.data.id}`, {
    //   level: 'info',
    //   contexts: record
    // });

    this.sentryClient.captureMessage(`pipelineService.execute: ${record.id}`, {
      level: 'info',
      contexts: record,
    });

    const startNode = await this.dealWithBeforeExcute(record, userId);

    // return {
    //   data:startNode
    // };
    //??????????????????
    this.startExecuteNode(startNode, userId);
    return record;
  }

  async getAllPipelinesByProjectId({ project_id }) {
    // const [pipelines] = await app.mysql.query(pipelinesConstants.SELECT_PIPELINES_BY_PROJECT_ID, [project_id]);

    const pipelines = await this.pipelinesRepository
      .createQueryBuilder('p')
      .where('p.project_id = :project_id', { project_id })
      .leftJoinAndMapOne('p.created_user', 'users', 'u', 'u.id = p.user_id')
      .orderBy('p.created_at', 'DESC')
      .getMany();

    return pipelines;
  }

  async getRelationShipInclude({ project_id }, { id }) {
    const pipelines = await this.getAllPipelinesByProjectId({
      project_id,
    });

    const fdata = pipelines.filter((item) => {
      // const nodes = item.nodes ? JSON.parse(item.nodes) : [];
      const hasTask = item.nodes.some(
        (node) =>
          node.shape !== 'start-node' &&
          node.data &&
          node.data.id === Number(id),
      );
      return hasTask;
    });

    const data = fdata.map((item2) => {
      return {
        id: item2.id,
        name: item2.name,
        created_user: item2['created_user'],
      };
    });

    // const result = await spliceUserInfo(data);

    return data;
  }

  async dealWithRestartPipeline(pipeLineRecord, userId) {
    try {
      const startNode = this.dealWithBeforeExcute(pipeLineRecord, userId);
      // ??????????????????????????????data.build??????????????????????????????executeNodes???  ??????????????????????????????status???2 ??????????????????0
      let preNodes = [startNode];
      let waitTime = 0;
      const hasShowNodes = [];
      while (preNodes.length > 0) {
        const currentNode: any = preNodes.shift();
        if (
          !hasShowNodes.includes(currentNode?.node?.id) &&
          currentNode?.node?.shape !== 'start-node'
        ) {
          if (currentNode?.node?.data?.build.state === 2) {
            currentNode['status'] = 2;
            currentNode['build_id'] = currentNode.node.data.build.buildId;
            this.executeNodes[currentNode?.node?.data?.build?.buildId + ''] =
              currentNode;
          }

          if (currentNode?.node?.data?.build?.state !== 2) {
            currentNode['status'] = 0;
            currentNode.node.data.build = null;
            //??????????????????
            await utils.sleep(waitTime * 10 * 1000);
            this.startExecuteNode(currentNode, userId);
            waitTime += 1;
          }

          if (currentNode?.node?.shape !== 'start-node') {
            hasShowNodes.push(currentNode.node.id);
          }
        }
        if (currentNode?.childs && currentNode?.childs?.length > 0) {
          preNodes = [...preNodes, ...(currentNode?.childs ?? [])];
        }
      }
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
    }
  }
}
