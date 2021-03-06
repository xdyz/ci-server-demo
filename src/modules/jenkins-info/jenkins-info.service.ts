import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JenkinsInfoEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateJenkinsInfoDto, UpdateJenkinsInfoDto } from './dtos/index.dto';
// import { got } from 'got';
// import axios from 'axios';
import * as utils from 'src/utils/index.utils';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class JenkinsInfoService {
  constructor(private readonly httpService: HttpService) {}

  @InjectRepository(JenkinsInfoEntity)
  private readonly jenkinsInfoRepository: Repository<JenkinsInfoEntity>;

  private maxWaitTime = 4 * 1000;

  async getOneJenkinsInfo(id) {
    // const [ jenkins_infos ] = await app.mysql.query(jenkinsInfoConstants.SELECT_JENKINS_INFO_BY_ID, [ id ]);
    const jenkinsInfo = await this.jenkinsInfoRepository.findOne(id);
    if (!jenkinsInfo) {
      throw new HttpException('Not found', HttpStatus.BAD_REQUEST);
    }
    return jenkinsInfo;
  }

  async getAllJenkinsInfo({ project_id }) {
    // const [ jenkinsInfos ] = await app.mysql.query(jenkinsInfoConstants.SELECT_JENKINS_INFO_BY_PROJECT_ID, [ project_id ]);
    const jenkinsInfos = await this.jenkinsInfoRepository.find({
      where: {
        project_id,
      },
    });

    return jenkinsInfos;
  }

  //{ display_name, protocol, hostname, port, user_name, token }
  async createJenkinsInfo({ project_id }, createJenkinsInfoDto) {
    try {
      const jenkinsInfo = await this.jenkinsInfoRepository.create({
        project_id,
        ...createJenkinsInfoDto,
      });
      const result = await this.jenkinsInfoRepository.save(jenkinsInfo);

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // { display_name, protocol, hostname, port, user_name, token }
  async updateJenkinsInfo(id, updateJenkinsInfoDto) {
    try {
      const jenkinsInfo = await this.jenkinsInfoRepository.save({
        id,
        ...updateJenkinsInfoDto,
      });
      return jenkinsInfo;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteJenkinsInfo(id) {
    try {
      await this.getOneJenkinsInfo(id);
      await this.jenkinsInfoRepository.delete(id);
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOneJenkinsInfoBYTask(id) {
    const res = await this.getOneJenkinsInfo(id);
    const { protocol, user_name, token, hostname, port } = res;
    return {
      baseUrl: `${protocol}://${user_name}:${token}@${hostname}:${port}`,
      jenkinsUrl: `${protocol}://${hostname}:${port}`,
    };
  }

  // jenkinsInfoService.initialize = async function () {
  //     Object.assign(app.ci, {
  //       getOneJenkinsInfo: jenkinsInfoService.getOneJenkinsInfo,
  //     });
  //   };

  // jenkins ??????

  findChild(id, nodes) {
    for (const node of nodes) {
      if (node.parents[0] === id) {
        return node;
      }
    }
    return null;
  }

  async getNextBuildNumber(baseUrl, jobName) {
    const res = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${jobName}/api/json`)
        .pipe(map((res) => res.data)),
    );
    return JSON.parse(res.body).nextBuildNumber;
  }

  async getJobNameAndParamters(jobName, parameters = {}) {
    const replaceJobName = jobName.replaceAll('/', '/job/');
    const paramsKeys = Object.keys(parameters);
    const urlSuffix =
      paramsKeys.length === 0 ||
      (paramsKeys.length === 1 && paramsKeys[0] === 'project_id')
        ? 'build'
        : 'buildWithParameters';
    return {
      replaceJobName,
      urlSuffix,
    };
  }

  // ???????????????job body ????????????????????????
  async buildJob(baseUrl, jobName, parameters) {
    const { replaceJobName, urlSuffix } = await this.getJobNameAndParamters(
      jobName,
      parameters,
    );
    const buildRes = await lastValueFrom(
      this.httpService
        .post(`${baseUrl}/job/${replaceJobName}/${urlSuffix}`, {
          data: parameters,
        })
        .pipe(map((res) => res.data)),
    );
    const splittedLocation = buildRes.headers.location.split('/');
    const queueItemNumber = splittedLocation[splittedLocation.length - 2];
    return {
      jobName,
      queueItemNumber,
    };
  }

  // server ??????job ??????query?????????????????????  ???????????????????????? server job ???????????????????????? ???????????? ?????????????????? ??????????????????????????????
  async buildJobQuery(baseUrl, jobName, quires) {
    const replaceJobName = jobName.replaceAll('/', '/job/');
    const url = encodeURI(
      `${baseUrl}/job/${replaceJobName}/buildWithParameters${quires}`,
    );
    const buildRes = await lastValueFrom(
      this.httpService.post(url).pipe(map((res) => res.data)),
    );
    const splittedLocation = buildRes.headers.location.split('/');
    const queueItemNumber = splittedLocation[splittedLocation.length - 2];
    return {
      jobName,
      queueItemNumber,
    };
  }

  async waitUntilJobStart(baseUrl, build) {
    let queueItemRes, queueItem;
    do {
      await utils.sleep(1000);
      queueItemRes = await this.httpService.get(
        `${baseUrl}/queue/item/${build.queueItemNumber}/api/json`,
      );
      queueItem = JSON.parse(queueItemRes.body);
    } while (!queueItem || !queueItem.executable);
    build.number = queueItem.executable.number;
    build.result = 'IN_PROGRESS';
  }

  async getStages(baseUrl, build) {
    const describeRes = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${build.jobName}/${build.number}/wfapi/describe`)
        .pipe(map((res) => res.data)),
    );
    const stages = JSON.parse(describeRes.body).stages;
    const treeRes = await lastValueFrom(
      this.httpService
        .get(
          `${baseUrl}/job/${build.jobName}/${build.number}/api/json?tree=actions[nodes[displayName,id,parents]]`,
        )
        .pipe(map((res) => res.data)),
    );
    const actions = JSON.parse(treeRes.body).actions;
    let nodes = [];
    for (const action of actions) {
      if (
        action._class ===
        'org.jenkinsci.plugins.workflow.job.views.FlowGraphAction'
      ) {
        nodes = action.nodes;
      }
    }
    for (const stage of stages) {
      let child = this.findChild(stage.id, nodes);
      while (child !== null && child.displayName !== 'Allocate node : Start') {
        child = this.findChild(child.id, nodes);
      }
      if (child !== null) {
        const logRes = await lastValueFrom(
          this.httpService
            .get(
              `${baseUrl}/job/${build.jobName}/${build.number}/execution/node/${child.id}/wfapi/log`,
            )
            .pipe(map((res) => res.data)),
        );
        const log = JSON.parse(logRes.body).text;
        const computerIndex = log.indexOf('/computer/');
        if (computerIndex >= 0) {
          const computer = log.substr(computerIndex + 10);
          stage.execNode = computer.substr(0, computer.indexOf('/'));
        }
        while (
          child !== null &&
          child.displayName !== 'Allocate workspace : Start'
        ) {
          child = this.findChild(child.id, nodes);
        }
        if (child !== null) {
          stage.wsNodeId = child.id;
        }
      }
    }
    return stages;
  }

  async waitUntilJobComplete(baseUrl, build) {
    let waitTime = 1000;
    let jobRes, job;
    const { replaceJobName } = await this.getJobNameAndParamters(
      build.jobName,
      {},
    );

    do {
      await utils.sleep(waitTime);
      waitTime = Math.min(this.maxWaitTime || 16 * 1000, waitTime * 2);
      jobRes = await this.httpService.get(
        `${baseUrl}/job/${replaceJobName}/${build.number}/api/json`,
      );
      job = JSON.parse(jobRes.body);
    } while (!job || job.result === null);
    console.log('waitUntilJobComplete', job.result);
    build.result = job.result;
  }

  async getConsoleText(baseUrl, jobName, buildNumber) {
    const res = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${jobName}/${buildNumber}/consoleText`)
        .pipe(map((res) => res.data)),
    );
    return res ? res.body : '';
  }

  async getJobApiJson(baseUrl, jobName) {
    const res = await lastValueFrom(
      this.httpService
        .get(`${baseUrl}/job/${jobName}/api/json`)
        .pipe(map((res) => res.data)),
    );
    return res ? res.body : '';
  }
}
