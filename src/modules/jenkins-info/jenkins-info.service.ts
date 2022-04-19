import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JenkinsInfoEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateJenkinsInfoDto } from './dtos/create-jenkins-info.dto';
import { UpdateJenkinsInfoDto } from './dtos/update-jenkins-info.dto';

@Injectable()
export class JenkinsInfoService {
  @InjectRepository(JenkinsInfoEntity)
  private readonly jenkinsInfoRepository: Repository<JenkinsInfoEntity>;

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
      const jenkinsInfo = await this.jenkinsInfoRepository.create(
        createJenkinsInfoDto,
      );
      const result = await this.jenkinsInfoRepository.save(jenkinsInfo);
      return {
        data: result,
      };
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
      return {
        data: jenkinsInfo,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteJenkinsInfo(id) {
    try {
      await this.getOneJenkinsInfo(id);
      await this.jenkinsInfoRepository.delete(id);
      return {};
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
}
