import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { CreateMinioDto } from './dtos/create-minio.dto';
import { UpdateMinioDto } from './dtos/update-minio.dto';
import { MinioService } from 'nestjs-minio-client';
import moment from 'moment';
@Injectable()
export class MinioClientService {
  constructor(
    private readonly projectService: ProjectsService,
    private readonly minio: MinioService,
  ) {}

  public get client() {
    return this.minio.client;
  }

  /**
   * 获取上传到minio 文件系统的一个 限时的url
   * @param {*} param0
   * @param {*} param1
   * @returns
   */

  async presignedPostPolicy({ project_id, user_id }, { fileName, pathDir }) {
    try {
      const project = await this.projectService.getOneProject(project_id);
      const { label } = project.data;
      // 策略为post 上传
      const policy = await this.client.newPostPolicy();
      policy.setBucket('devops');
      policy.setKey(`${pathDir}/${label}/${fileName}`);
      const data = await this.client.presignedPostPolicy(policy);

      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  getListObjectsInfo = async (stream) => {
    const data = [];
    stream.on('data', (obj) => {
      data.push(obj);
    });

    return new Promise((reslove) => {
      stream.on('end', () => {
        reslove(data);
      });
    });
  };

  async getProjectAssetBundles({ project_id }, { pathDir }) {
    try {
      const project = await this.projectService.getOneProject(project_id);
      const { label } = project.data;

      const stream = await this.client.listObjects(
        'devops',
        `${pathDir}/${label}`,
        true,
      );

      const data = await this.getListObjectsInfo(stream);

      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 生成一个下载地址
  async presignedGetObject({ pathDir }) {
    try {
      const data = await this.client.presignedGetObject('devops', pathDir);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 上传文件之间 将需要的地址配置好
  async beforePutObject({ val, projectId, jobName, buildNumber, time = '' }) {
    try {
      const project = await this.projectService.getOneProject(
        Number(projectId),
      );
      const { label } = project.data;
      const filePath = `resultFile/${label}/${jobName}/${
        time ? time : moment().format('YYYY-MM-DD')
      }/${buildNumber}.json`;
      await this.putObject({
        val,
        pathDir: filePath,
      });

      return filePath;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 直接上传文件至文件系统 通过stream 流的方式进行
  async putObject({ val, pathDir }) {
    try {
      await this.client.putObject('devops', pathDir, val);
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  getFile = async (dataStream) => {
    let data = '';
    dataStream.on('data', (stream) => {
      data += stream;
    });

    return new Promise((reslove, reject) => {
      dataStream.on('end', () => {
        reslove(data);
      });

      dataStream.on('err', () => {
        reject(data);
      });
    });
  };

  // 通过stream 的方式获取到文件内容
  async getObject(pathDir) {
    try {
      const filePromise = this.client.getObject('devops', pathDir);
      const result = await this.getFile(await filePromise);

      return {
        data: result ? JSON.parse(result as string) : {},
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
