import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import * as utils from 'src/utils/index.utils';
@Injectable()
export class ResourceRecordsService {
  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;

  async dealWithQuery(params = {}) {
    const result = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val) {
        result[key] = Like(`%${val}%`);
      }
    });

    return result;
  }

  async getResourceRecords({ project_id }, { page, size, ...queries }) {
    const params = this.dealWithQuery(queries);
    const [list, total] = await this.buildsRepository
      .createQueryBuilder('b')
      .where(`b.project_id = :project_id`, { project_id })
      .andWhere(`b.build_type = :build_type`, {
        build_type: utils.buildTypes.CHECK,
      })
      .andWhere(params)
      .leftJoinAndMapOne('b.user', 'users', 'u', 'b.user_id = u.id')
      .leftJoinAndMapOne(
        'b.instance',
        'resource_instances',
        'r',
        "b.parameters->>'instance_id' = r.id",
      )
      .offset((page - 1) * size)
      .limit(size)
      .orderBy('b.number', 'DESC')
      .getManyAndCount();
    return {
      list,
      total,
    };
  }
}
