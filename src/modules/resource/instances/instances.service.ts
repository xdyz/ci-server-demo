import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceInstanceEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ResourceInstancesService {
  @InjectRepository(ResourceInstanceEntity)
  private readonly resourceInstanceRepository: Repository<ResourceInstanceEntity>;

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

  async getOneResourceInstanceById(id) {
    // const [instances] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_INSTANCES_BY_ID_AND_IS_DEL, [id, 0]);
    const instance = await this.resourceInstanceRepository
      .createQueryBuilder('instance')
      .leftJoinAndMapOne(
        'instance.create_user',
        'UsersEntity',
        'u',
        'user.id = instance.user_id',
      )
      .leftJoinAndMapOne(
        'instance.latest_build',
        'BuildsEntity',
        'b',
        "JSON_EXTRACT(b.parameters, '$.instance_id') = instance.id",
      )
      .where('instance.id = :id', { id })
      .andWhere('instance.is_del = :is_del', { is_del: 0 })
      .getOne();
    // const result = await dealWithInstance([instance]);

    return instance;
  }

  /**
   * 获取检查实例
   * @param {{page: number, size: number, ...queries}} queries
   */
  async getResourceInstances({ project_id }, { page, size, ...queries }) {
    const params = this.dealWithQuery(queries);
    const [list, total] = await this.resourceInstanceRepository
      .createQueryBuilder('instance')
      .leftJoinAndMapOne(
        'instance.create_user',
        'UsersEntity',
        'u',
        'user.id = instance.user_id',
      )
      .leftJoinAndMapOne(
        'instance.latest_build',
        'BuildsEntity',
        'b',
        "JSON_EXTRACT(b.parameters, '$.instance_id') = instance.id",
      )
      .where('instance.project_id = :project_id', { project_id })
      .andWhere('instance.is_del = :is_del', { is_del: 0 })
      .andWhere(params)
      .offset((page - 1) * size)
      .limit(size)
      .orderBy('instance.created_at', 'DESC')
      .getManyAndCount();

    return {
      list,
      total,
    };
  }

  /**
   * 获取所有的实例
   * @returns
   */
  async getAllResourceInstances({ project_id }) {
    // const [instances] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_INSTANCES_BY_IS_DEL_AND_PROJECT_ID, [0, project_id]);
    const instances = await this.resourceInstanceRepository.find({
      where: {
        project_id,
        is_del: 0,
      },
    });

    return instances;
  }

  /**
   * 获取单个实例信息
   * @param {id: number} param0
   * @returns
   */
  async getOneResourceInstance(id) {
    const data = await this.getOneResourceInstanceById(id);

    return data;
  }

  /**
   * 新增检查实例
   * @param {number} create_user
   * @param {{name: string}} param1
   * @returns
   */
  async insertResourceInstances({ project_id, user_id }, createInstanceDto) {
    try {
      const instance = await this.resourceInstanceRepository.create({
        user_id,
        project_id,
        ...createInstanceDto,
      });
      const data = await this.resourceInstanceRepository.save(instance);

      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新检查实例
   * @param {number} id
   * @param {{name: string}} param1
   * @returns
   */
  async updateResourceInstances(id, updateInstanceDto) {
    try {
      const data = await this.resourceInstanceRepository.save({
        id,
        ...updateInstanceDto,
      });

      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 删除检查实例  删除检查实例的时候需要将 检查实例下的所有检查项一并删除了，不然容易造成数据冗余
   * @param {number} id
   * @returns
   */
  async deleteResourceInstances(id) {
    const instance = await this.getOneResourceInstanceById(id);
    if (!instance) {
      throw new HttpException('检查实例不存在', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.resourceInstanceRepository.save({ id, is_del: 1 });
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
