import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PipelineRecordsEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import { PipelinesListService } from '../pipeline-list/pipeline-list.service';

@Injectable()
export class PipelinesRecordsService {
  @Inject()
  private readonly pipelinesListSerivce: PipelinesListService;

  @InjectRepository(PipelineRecordsEntity)
  private readonly pipelineRecordsRepository: Repository<PipelineRecordsEntity>;

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

  // 管线配置 执行记录
  async getPipelineRecordsList({ project_id }, { page, size, ...rest }) {
    const params = this.dealWithQuery(rest);

    const [data, total] = await this.pipelineRecordsRepository
      .createQueryBuilder('p')
      .where('p.project_id = :project_id', { project_id })
      .andWhere(params)
      .leftJoinAndMapOne(
        'p.created_user',
        'users',
        'u',
        'u.id = p.created_user',
      )
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    return {
      data,
      total,
    };
  }

  async getOnePipelineRecordInfo(id) {
    const data = await this.pipelineRecordsRepository
      .createQueryBuilder('p')
      .where('p.id = :id', { id })
      .leftJoinAndMapOne(
        'p.created_user',
        'users',
        'u',
        'u.id = p.created_user',
      )
      .getOne();

    return data;
  }

  // 新增执行记录
  // { pipeline_id, name, nodes, create_user, edges, notify_enable, notify_users, document_url, description }
  async insertPipelineRecord({ project_id }, createPipeRecordDto) {
    try {
      const record = await this.pipelineRecordsRepository.create({
        ...createPipeRecordDto,
        project_id,
      });
      const data = await this.pipelineRecordsRepository.save(record);

      const result = await this.getOnePipelineRecordInfo(data['id']);

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 重试节点
  async restartPipelineRecord({ user_id }, id) {
    try {
      await this.pipelineRecordsRepository.save({
        id,
        status: 1,
      });
      const pipeRecord = await this.pipelineRecordsRepository.findOne(id);
      this.pipelinesListSerivce.dealWithRestartPipeline(pipeRecord, user_id);
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 根据pipeline_id 和 时间段获取执行记录
   * @param {*} pipeline_id
   * @param {*} from 开始时间
   * @param {*} to 结束时间
   */

  async getPipelineRecordByPipelineIdAndTime({ pipeline_id, from, to }) {
    // const [pipelines] = await app.mysql.query(pipelinesConstants.SELECT_PIPELINES_RECORDS_BY_ID_AND_TIME_RANGE,
    //   [Number(pipeline_id), Number(from), Number(to)]);
    // const data = await spliceUserInfo(pipelines);
    const data = await this.pipelineRecordsRepository
      .createQueryBuilder('pr')
      .where('pr.pipeline_id = :pipeline_id', { pipeline_id })
      .andWhere('pr.created_at >= :from', { from })
      .andWhere('pr.created_at <= :to', { to })
      .leftJoinAndMapOne('pr.created_user', 'users', 'u', 'u.id = pr.user_id')
      .orderBy('pr.created_at', 'DESC')
      .getMany();

    return data;
  }
}
