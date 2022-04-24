import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PipelinesEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import objectPath from 'object-path';
import moment from 'moment';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { PipelinesRecordsService } from '../records/records.service';
import { JenkinsInfoService } from 'src/modules/jenkins-info/jenkins-info.service';
import got from 'got';
import { BuildsService } from 'src/modules/tasks/builds/builds.service';
import * as utils from 'src/utils/index.utils';
import { WsService } from 'src/modules/websocket/ws.service';
import { NotifyService } from 'src/modules/notify/notify.service';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
@Injectable()
export class PipelinesListService implements OnModuleInit {
  sentryClient: any;
  constructor(@InjectSentry() private readonly sentryService: SentryService) {
    this.sentryClient = sentryService.instance();
  }

  @Inject()
  private readonly pipelinesRecordsService: PipelinesRecordsService;

  @Inject()
  private readonly buildsService: BuildsService;

  @Inject()
  private readonly jenkinsInfoService: JenkinsInfoService;

  @Inject()
  private readonly notifyService: NotifyService;

  @Inject()
  private readonly wsService: WsService;

  @InjectRepository(PipelinesEntity)
  private pipelinesRepository: Repository<PipelinesEntity>;

  public pipelinesData = {};
  public executeNodes = {};
  public schedules = {};

  // 触发类型
  TRIGER_TYPE = {
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

  // 通知用户
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

  // 通知用户前处理好数据
  async beforeNodeToUser(piplineData, node, status) {
    // try {
    const exg = new RegExp(/\${.*?\}/g);
    const msgs = node.data.extra.message.match(exg);
    let message = node.data.extra.message;
    if (msgs) {
      await utils.sleep(10 * 1000);
      // res 被eval 解析出想要的数据 这里不能删除
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
        `管线：${piplineData.data.name}` +
        '\n' +
        `节点：${node.data.display_name}` +
        '\n' +
        `状态：${status === 2 ? '成功' : '失败'}` +
        '\n' +
        `信息：${message}` +
        '\n' +
        `地址：[DevOps 平台](https://devops.sofunny.io/taskPipeline/records/${piplineData.pipeline_record_id})`,
    });

    // } catch (error) {
    //   console.log('node notify', error);
    // }
  }

  // 只要所有的节点没有状态小于2的了那么就代表这个管线跑完成了
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

  // 最终的管线结果
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

  // 计算管线内的成功个数和失败个数 还有耗时
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

  //任务结束后的处理
  async buildEnd(eventData) {
    // app.sentry.captureMessage(`任务结束 ${eventData.id}`, {
    //   level: 'info',
    //   contexts: eventData
    // });
    this.sentryClient.captureMessage(`任务结束 ${eventData.id}`, {
      contexts: eventData,
    });
    //是否是管线里面执行任务
    const build_id = eventData.id;
    const executeNode = this.executeNodes[build_id + ''];
    if (!executeNode) {
      return;
    }

    //构建状态更新
    const status = eventData.status;

    executeNode.status = status;
    const node = executeNode.node;
    //将构建结果的关键数据保存到管线节点
    node.data.build = {
      buildId: eventData.id,
      state: status,
      type: eventData.build_type,
      duration: eventData.duration,
    };

    //依据执行节点的管线记录id获得管线记录数据
    const p_record_id = executeNode.pipline_record_id;
    const piplineData = this.pipelinesData[p_record_id + ''];
    // app.sentry.captureMessage(`builEnd: ${build_id}`, {
    //   level: 'info',
    //   contexts: eventData
    // });
    this.sentryClient.captureMessage(`builEnd: ${build_id}`, {
      contexts: eventData,
    });
    // 如果当前节点执行成功了，那么就可以串行执行下面的子节点
    if (status === 2) {
      this.startExecuteNode(executeNode, piplineData.userId);
    } else if (status > 2) {
      // app.sentry.captureMessage(`节点执行失败: ${p_record_id}`, {
      //   level: 'info',
      //   contexts: executeNode
      // });
      this.sentryClient.captureMessage(`builEnd: ${build_id}`, {
        contexts: executeNode,
      });
      // 当前节点执行失败，将其子节点状态均设置为5 也就是不可执行的状态
      this.setFailurChildNotAllow(executeNode);
    }

    // 如果节点执行完成了，配置了通知，就通知对应的用户
    if (
      node &&
      node.data &&
      node.data.extra &&
      node.data.extra.isNotify &&
      node.data.extra.users
    ) {
      // 发送消息
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
            `管线：${piplineData.data.name}` +
            '\n' +
            `成功：${passCount}` +
            '\n' +
            `失败：${failCount}` +
            '\n' +
            `耗时：${utils.parseDuration(duration)}` +
            '\n' +
            `地址：[DevOps 平台](http://devops.wll/taskPipeline/records/${piplineData.pipeline_record_id})`,
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

  // 服务器启动，获取所有的定时任务然后启动定时 这里就不需要区分项目了
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

  // 启动时间触发事件
  schedule(row) {
    const { id, created_user, schedule_time, triger_type, week_day } = row;
    const moment_data = moment(schedule_time, 'YYYY-MM-DD HH:mm:ss');
    const second = moment_data.seconds();
    const minute = moment_data.minutes();
    const hour = moment_data.hours();
    const schedule_obj = {
      hour,
      second,
      minute,
    };
    // 不重复的管线 获取年月日
    if (triger_type === this.TRIGER_TYPE.NO_REPEAT) {
      Object.assign(schedule_obj, {
        year: moment_data.year(),
        month: moment_data.month(),
        date: moment_data.date(),
      });
      // schedule_obj.year = moment_data.year();
      // schedule_obj.month = moment_data.month();
      // schedule_obj.date = moment_data.date();
      const pipelint_time = new Date(schedule_time).getTime();
      // 任务到期
      if (pipelint_time < new Date().getTime()) {
        return;
      }
    }

    if (triger_type === this.TRIGER_TYPE.WEEK_DAY) {
      // schedule_obj.dayOfWeek = week_day;
      Object.assign(schedule_obj, {
        dayOfWeek: week_day,
      });
    }

    const scheduleEvent = scheduler.scheduleJob(schedule_obj, () => {
      // 不是工作日不执行
      if (triger_type === this.TRIGER_TYPE.WORK_DAY) {
        const cur_day = new Date().getDay();
        if (cur_day === 0 || cur_day === 6) {
          return;
        }
      }

      // if (triger_type === TRIGER_TYPE.WEEK_DAY) {
      //   //  不是设置好的 周几 日期  则不执行
      //   const cur_day = new Date().getDay();
      //   if (week_day !== cur_day) {
      //     return;
      //   }
      // }
      this.execute(id, created_user.id);
      // 不重复 执行完删除定时器
      if (triger_type === this.TRIGER_TYPE.NO_REPEAT) {
        const event = this.schedules[id];
        event.cancel();
        delete this.schedules[id];
        return;
      }
    });

    this.schedules[id] = scheduleEvent;
  }

  // 分页获取管线
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
      data: {
        data,
        total,
      },
    };
  }

  // 根据id 查询单个pipeline 信息
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
    return {
      data: pipeline,
    };
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
      // 如果已经有了定时器 就先取消定时器
      if (this.schedules[info.data.id]) {
        const event = this.schedules[info.data.id];
        event.cancel();
        delete this.schedules[id];
      }
      //  如果配置了定时 就启动定时
      if (info.data.schedule_time) {
        this.schedule(info.data);
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
      return {
        data,
      };
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePipeline(id) {
    try {
      await this.pipelinesRepository.delete(id);
      if (this.schedules[id]) {
        const event = this.schedules[id];
        event.cancel();
        delete this.schedules[id];
      }
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
      // 如果已经有了定时器 就先取消定时器
      if (this.schedules[info.data.id]) {
        const event = this.schedules[info.data.id];
        event.cancel();
        delete this.schedules[pid];
      }
      //  如果配置了定时 就启动定时
      if (info.data.schedule_time) {
        this.schedule(info.data);
      }
      return info;
    } catch (error) {
      throw error;
    }
  }

  async getJobApiJson(baseUrl, jobName) {
    const replaceJobName = jobName.replaceAll('/', '/job/');
    const res = await got.get(`${baseUrl}/job/${replaceJobName}/api/json`);
    return res ? res.body : '';
  }

  // 设置type
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
    // 埋点查看更新状态
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

  // 将刚启动的节点设置为运行中
  async setNodeStartState(build_id) {
    const executeNode = this.executeNodes[build_id + ''];
    if (!executeNode) {
      return;
    }
    //构建状态更新
    executeNode.status = 1;
    const node = executeNode.node;
    //将构建结果的关键数据保存到管线节点
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

  // 覆盖参数
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

  //执行节点任务
  async startTask(executeNode, user_id) {
    try {
      await utils.sleep(120000 * executeNode.index);
      const taksData = executeNode.node.data;

      // 如果当前这个节点已经正在跑了 就不要再次跑了
      if (taksData && taksData.build && taksData.build.state > 0) {
        return;
      }

      const buildData = await this.buildsService.startTask({
        taksData: taksData,
        userId: user_id,
      });
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
      // 然后通知 节点的状态变为执行中 此时在正式执行之前就将节点的状态进行改变
      this.setNodeStartState(build_id);
    } catch (err) {
      // app.sentry.captureException(err);
      this.sentryClient.captureException(err);
      executeNode.status = 3;
    }
  }

  /**
   * 开始执行节点
   * 节点处于运行状态停止处理
   * 节点处于未执行状态执行该节点
   * 节点处于成功状态执行其子节点
   * 如果jk job 处于某一种状态 此时再次执行同一个job 就无法执行成功，这里应该需要做一个判断，如果有处于pending状态之前的应该是无法再次执行的？？？？？？？？？？
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

          // 处理需要覆盖的参数
          this.startTask(element, user_id);
        }
      }
    }
  }

  //创建用于运行管线的节点数据结构
  createExecuteNode(node) {
    const executeNode = {
      parents: [], //父节点
      node: node, // 节点数据
      childs: [], //子节点 ExecuteNode
      build_id: 0, //节点运行时对应的构建id
      status: 0, //节点运行状态
      pipline_record_id: 0, //节点的管线记录
      index: 0,
    };
    return executeNode;
  }

  //获得管线节点树
  getNodeTree(startNode, nodes, edges, pipline_record_id, cacheNodes) {
    const id = startNode.node.id;
    for (let index = 0; index < edges.length; index++) {
      const element = edges[index];
      // 如果来源id 是当前节点的ID 那就说明这线的target cell 对应的节点是  startNode 的子节点
      if (element.source.cell === id) {
        // 找出子节点 并且将子节点处理成我们需要的数据
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

        // 如果没有push 过的节点才可以push
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

  // 在运行之前处理好参数
  dealWithBeforeExcute(record, userId) {
    try {
      //节点坐标数据和节点参数 web 可视化用的数据
      const record_data = record;
      const nodes = JSON.parse(record_data.nodes);
      record_data.nodes = nodes;

      //节点可连线数据
      const edges = JSON.parse(record_data.edges); // 节点关系数据
      record_data.edges = edges;

      //创建管线的树形运行数据结构
      // const startNode = getNodeByShape(nodes, 'start-node'); //获取开始节点
      const startNode = nodes.find((item) => item.shape === 'start-node');
      const startNodeData = this.createExecuteNode(startNode); // 将节点数据配置成为我们需要的数据
      const pipline_record_id = record_data.id;
      startNodeData.pipline_record_id = pipline_record_id;
      startNodeData.status = 2; //开始阶段默认成功执行

      const cacheNodes = {};
      this.getNodeTree(
        startNodeData,
        nodes,
        edges,
        pipline_record_id,
        cacheNodes,
      );

      this.pipelinesData[pipline_record_id + ''] = {
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

  //运行管线
  async execute(id, userId) {
    //创建管线记录
    const pipline = await this.getOnePipeline(id);
    const pipdata = pipline.data;
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
    //开始运行节点
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
      // 这里还需要将所有的有data.build记录的节点都先记录到executeNodes中  已经通过的设置节点的status为2 失败的转换为0
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
            //开始运行节点
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
