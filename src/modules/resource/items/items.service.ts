import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResourceCategoryExtraEntity,
  ResourceInstanceItemsEntity,
} from 'src/entities';
import { getConnection, Like, Repository } from 'typeorm';
import { ResourceCategoryService } from '../category/category.service';
import { ResourceTermsService } from '../terms/terms.service';

@Injectable()
export class ResourceInstanceItemsService {
  constructor(
    private readonly resourceTermsService: ResourceTermsService,
    private readonly resourceCategoryService: ResourceCategoryService,
  ) {}

  @InjectRepository(ResourceInstanceItemsEntity)
  private readonly resourceInstanceItemRepository: Repository<ResourceInstanceItemsEntity>;

  @InjectRepository(ResourceCategoryExtraEntity)
  private readonly resourceCategoryExtraRepository: Repository<ResourceCategoryExtraEntity>;

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

  /**
   * 获取某个实例内的单个检查项
   * @param {number} id
   * @returns
   */
  async getOneInstanceItemsById(id) {
    // const [items] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_INSTANCE_ITEMS_BY_ID, [id]);
    const data = await this.resourceInstanceItemRepository
      .createQueryBuilder('instance_item')
      .where('instance_item.instance_id = :id', { id })
      .leftJoinAndMapOne(
        'instance_item.term',
        'resource_term',
        'term',
        'instance_item.term_id = term.id',
      )
      .select([
        'instance_item.id',
        'instance_item.term_id',
        'instance_item.threshold_value',
        'instance_item.filter_paths',
        'instance_item.detect_paths',
        'instance_item.filter_regex',
        'instance_item.enabled',
        'instance_item.instance_id',
        'term.category_id',
        'term.rule_uid',
        'term.rule_name',
        'term.level',
        'term.suggest',
        'term.rule_desc',
        'term.threshold_range',
      ])
      .getMany();
    // const result = await dealWithAllTermsToWeb(items);

    return data;
  }

  /**
   * 一次性获取检查实例对应的所有的检查项
   */
  async getResourceInstanceItems(
    { project_id },
    { instance_id },
    queries = {},
  ) {
    const params = this.dealWithQuery(queries);
    const data = await this.resourceInstanceItemRepository
      .createQueryBuilder('instance_item')
      .where('instance_item.instance_id = :instance_id', { instance_id })
      .andWhere('instance_item.project_id = :project_id', { project_id })
      .andWhere(params)
      .leftJoinAndMapOne(
        'instance_item.term',
        'resource_term',
        'term',
        'instance_item.term_id = term.id',
      )
      .select([
        'instance_item.id',
        'instance_item.term_id',
        'instance_item.threshold_value',
        'instance_item.filter_paths',
        'instance_item.detect_paths',
        'instance_item.filter_regex',
        'instance_item.enabled',
        'instance_item.instance_id',
        'term.category_id',
        'term.rule_uid',
        'term.rule_name',
        'term.level',
        'term.suggest',
        'term.rule_desc',
        'term.threshold_range',
      ])
      .getOne();

    return data;
  }

  /**
   * 实例新增检查项 批量
   * @param {{instance_id: number}} param0 实例id
   * @param {{ids: number[]}} param1 模板ids
   */
  async insertResourceInstanceItems({ project_id }, { instance_id }, { ids }) {
    // const connection = await app.mysql.getConnection();
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // await connection.beginTransaction();

      for (let index = 0; index < ids.length; index++) {
        const term_id = ids[index];
        const terms = await this.resourceTermsService.getOneResourceTerm(
          term_id,
        );
        if (terms) {
          // const {
          //   enabled,
          //   threshold_value,
          //   filter_regex,
          //   filter_paths,
          //   detect_paths,
          // } = terms;
          // await connection.query(resourceConstants.INSERT_RESOURCE_INSTANCE_ITEMS, [term_id, enabled, threshold_value, filter_regex, filter_paths, detect_paths, instance_id, project_id]);
          const item = await queryRunner.manager.create(
            ResourceInstanceItemsEntity,
            {
              ...terms,
              instance_id,
              project_id,
            },
          );
          await queryRunner.manager.save(ResourceInstanceItemsEntity, item);
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }

    return {};
  }

  /**
   * 更新检查实例自己内部的检查项
   * @param {{instance_id: number, item_id: number}} param0 实例id 和 对应的检查项id
   * @param {{enabled: boolean, threshold_value: string, filter_paths: string, filter_regex: string, detect_paths: string}} param1
   * @returns
   */
  //{ enabled, threshold_value, filter_regex, filter_paths, detect_paths },
  async updateResourceInstanceItems(
    { instance_id, item_id },
    updateInstanceItemDto,
  ) {
    try {
      const data = await this.resourceInstanceItemRepository.save({
        ...updateInstanceItemDto,
        instance_id,
        item_id,
      });
      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 删除实例内的检查项
   * @param {{instance_id: number, item_id: number}} param0
   * @returns
   */
  async deleteResourceInstanceItems({ instance_id, item_id }) {
    const data = await this.getOneInstanceItemsById(item_id);
    if (!data) {
      return {
        error: '该检查项不存在',
      };
    }

    try {
      await this.resourceInstanceItemRepository.delete({
        instance_id,
        id: item_id,
      });

      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 复制
   * @param {{instance_id: number, item_id: number}} param0
   * @returns
   */
  async copyResourceInstanceItems({ item_id }) {
    try {
      const { id, ...rest } = await this.resourceInstanceItemRepository.findOne(
        {
          id: item_id,
        },
      );
      const item = await this.resourceInstanceItemRepository.create({
        ...rest,
      });
      const data = await this.resourceInstanceItemRepository.save({
        ...item,
      });
      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getParamsFromExtra(ids, project_id) {
    // const [params] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_CATEGORY_EXTRA_BY_PROJECT_ID_AND_CATEGORY_ID, [ids, project_id]);
    const data = await this.resourceCategoryExtraRepository
      .createQueryBuilder('category_extra')
      .where('category_extra.category_id IN (:ids)', { ids })
      .andWhere('category_extra.project_id = :project_id', { project_id })
      .getMany();

    return data;
  }

  /**
   * 给Jenkins 传递的数据
   * @param {*} data
   * @returns
   */
  async dealWithAllTermsToJenkins(data = [], project_id) {
    let configs = [];
    let params = [];
    if (data.length === 0)
      return {
        configs,
        params,
      };
    try {
      const categoryIds = [];
      configs = await Promise.all(
        data.map(async (item) => {
          const {
            term_id,
            threshold_value,
            filter_paths,
            detect_paths,
            filter_regex,
          } = item;
          const term = await this.resourceTermsService.getOneResourceTerm(
            term_id,
          );
          const { category_id, rule_uid } = term;
          categoryIds.push(category_id);
          const { category_uid } =
            await this.resourceCategoryService.getOneClassificationById(
              category_id,
            );
          return {
            rule_uid,
            category_uid,
            filter_paths: filter_paths ? filter_paths.split(',') : [],
            detect_paths: detect_paths ? detect_paths.split(',') : [],
            threshold_value,
            filter_regex,
          };
        }),
      );

      params = await this.getParamsFromExtra(categoryIds, project_id);
    } catch (error) {
      // app.utils.log.error('transform_to_jenkins', error);
    }

    return {
      configs,
      params,
    };
  }

  /**
   * 根据实例id 获取实例下所有的检查项  to Jenkins
   * @param {number} instance_id
   * @returns
   */
  async getAllResourceInstancesItems(instance_id, project_id) {
    // const [items] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_INSTANCE_ITEMS_BY_INSTANCE_ID_AND_ENABLED, [instance_id, 1]);
    const items = await this.resourceInstanceItemRepository.find({
      where: {
        instance_id,
        enabled: 1,
      },
    });

    const data = await this.dealWithAllTermsToJenkins(items, project_id);

    return data;
  }
}
