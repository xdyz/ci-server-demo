import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResourceCategoryEntity,
  ResourceCategoryExtraEntity,
  ResourceInstanceItemsEntity,
  ResourceTermsEntity,
} from 'src/entities';
import { getConnection, Like, Repository } from 'typeorm';
import { ResourceCategoryService } from '../category/category.service';

@Injectable()
export class ResourceTermsService {
  @Inject()
  private resourceCategoryService: ResourceCategoryService;

  @InjectRepository(ResourceTermsEntity)
  private readonly resourceTermsRepository: Repository<ResourceTermsEntity>;

  @InjectRepository(ResourceCategoryExtraEntity)
  private readonly categoryExtraRepository: Repository<ResourceCategoryExtraEntity>;

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
   * 通过id 获取单个资源检查项
   * @param {number} id
   * @returns
   */
  async getOneResourceTerm(id) {
    // const [terms] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_TERMS_BY_ID, [id]);
    const term = await this.resourceTermsRepository.findOne(id);

    return term;
  }

  /**
   * 检查项查询 查询所有的检查项
   * @returns
   */

  async getResourceTerms({ project_id }, queries) {
    const params = this.dealWithQuery(queries);
    const terms = await this.resourceTermsRepository
      .createQueryBuilder('terms')
      .where('terms.project_id in (:project_id)', {
        project_id: [project_id, 0],
      })
      .andWhere(params)
      .getMany();

    return terms;
  }

  /**
   * 增加检查项
   * @param {*} param0
   * @returns
   */
  //  { rule_uid, rule_name, category_id, level, rule_desc, suggest, enabled, threshold_value, filter_regex, filter_paths, detect_paths, threshold_range }
  async insertResourceTerms({ project_id }, createTermDto) {
    try {
      const term = await this.resourceTermsRepository.create({
        project_id,
        ...createTermDto,
      });
      const data = await this.resourceTermsRepository.save(term);
      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新检查项
   * @param {number} id
   * @param {*} param1
   * @returns
   */
  //  { rule_uid, rule_name, category_id, level, rule_desc, suggest, enabled, threshold_value, filter_regex, filter_paths, detect_paths, threshold_range }
  async updateResourceTerms(id, updateTermDto) {
    try {
      const data = await this.resourceTermsRepository.save({
        id,
        ...updateTermDto,
      });
      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 删除检查项
   * @param {number} id
   * @returns
   */
  async deleteResourceTerms(id) {
    const terData = await this.getOneResourceTerm(id);
    if (!terData) {
      throw new HttpException('检查项不存在', HttpStatus.BAD_REQUEST);
    }

    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(ResourceTermsEntity, {
        id,
      });
      await queryRunner.manager.delete(ResourceInstanceItemsEntity, {
        term_id: id,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
    return {};
  }

  async deleteResourceTermsByCateId(category_id) {
    // return {};
    try {
      await this.resourceTermsRepository.delete({ category_id });
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 后续需要拿 事务 重写一一次
   * 导入json 检查项数据
   * 检查分类如果存在就存储到对应分类下，如果不存在就先创分类然后，继续存到对应分类下
   * 检查项如果存在，就不新增该检查项，检查项如果不存在，就新建检查项
   * @param {} data
   */
  async uploadResourceTerms({ project_id }, data) {
    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const { rules, params } = data
        ? JSON.parse(data)
        : { params: [], rules: [] };
      for (let i = 0; i < rules.length; i++) {
        const el = rules[i];
        let cates;
        if (el && el.category_uid) {
          const { category_uid, category_name } = el;
          // const cateData = await getOneClassificationByUid(
          //   project_id,
          //   category_uid,
          // );

          const cateData = await queryRunner.manager.findOne(
            ResourceCategoryEntity,
            {
              select: ['id', 'category_uid'],
              where: {
                project_id,
                category_uid,
              },
            },
          );

          if (!cateData) {
            // cates = await resourceService.insertClassification(
            //   { project_id },
            //   { category_uid, category_name },
            // );
            const cate = await queryRunner.manager.create(
              ResourceCategoryEntity,
              {
                project_id,
                category_uid,
                category_name,
              },
            );
            cates = await queryRunner.manager.save(cate);
          }

          if (el.detect_paths) {
            el.detect_paths = el.detect_paths.join(',');
          }
          if (el.filter_paths) {
            el.filter_paths = el.filter_paths.join(',');
          }
          el.category_id = cateData ? cateData.id : cates.id;
          if (el.rule_uid) {
            // const hasTerm = await this.getOneResourceTermByUid(
            //   { project_id },
            //   el.rule_uid,
            // );
            const hasTerm = await queryRunner.manager.findOne(
              ResourceTermsEntity,
              {
                select: ['id'],
                where: {
                  project_id,
                  rule_uid: el.rule_uid,
                },
              },
            );
            if (!hasTerm) {
              // await this.insertResourceTerms({ project_id }, el);
              const term = await queryRunner.manager.create(
                ResourceTermsEntity,
                {
                  project_id,
                  ...el,
                },
              );
              await queryRunner.manager.save(term);
            }
          }
        }
      }

      if (params && params.length !== 0) {
        for (let x = 0; x < params.length; x++) {
          const pars = params[x];
          // const cateData = await getOneClassificationByUid(
          //   project_id,
          //   pars.category_uid,
          // );
          const cateData = await queryRunner.manager.findOne(
            ResourceCategoryEntity,
            {
              select: ['id', 'category_uid'],
              where: {
                project_id,
                category_uid: pars.category_uid,
              },
            },
          );
          // await resourceService.setClassificationExtra(
          //   { project_id },
          //   {
          //     category_id: cateData.id,
          //     category_uid: pars.category_uid,
          //     global_params: pars.global_params,
          //   },
          // );
          const extra = await queryRunner.manager.create(
            ResourceCategoryExtraEntity,
            {
              project_id,
              category_id: cateData.id,
              category_uid: pars.category_uid,
              global_params: pars.global_params,
            },
          );
          await queryRunner.manager.save(extra);
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

  async getParamsFromExtra(ids, project_id) {
    // const [params] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_CATEGORY_EXTRA_BY_PROJECT_ID_AND_CATEGORY_ID, [ids, project_id]);
    const data = await this.categoryExtraRepository
      .createQueryBuilder('category_extra')
      .where('category_extra.category_id IN (:ids)', { ids })
      .andWhere('category_extra.project_id = :project_id', { project_id })
      .getMany();
    return data;
  }

  /**
   * Unity 同步数据时 处理数据的方式
   * @param {*} data
   * @returns
   */
  async dealWithAllTermsToUnity(data = [], project_id) {
    let rules = [];
    let params = [];
    if (data.length === 0)
      return {
        rules,
        params,
      };
    const categoryIds = [];
    try {
      rules = await Promise.all(
        data.map(async (item) => {
          const { category_id, filter_paths, detect_paths, ...rest } = item;
          categoryIds.push(category_id);
          const { category_uid, category_name } =
            await this.resourceCategoryService.getOneClassificationById(
              category_id,
            );
          return {
            category_name,
            category_uid,
            filter_paths: filter_paths ? filter_paths.split(',') : [],
            detect_paths: detect_paths ? detect_paths.split(',') : [],
            ...rest,
          };
        }),
      );

      params = await this.getParamsFromExtra(categoryIds, project_id);
    } catch (error) {}

    return {
      rules,
      params,
    };
  }

  /**
   * 获取所有的检查项的数据 同步给Unity
   * @returns
   */

  async getAllResourceTermsToUnity({ project_id }) {
    // const [terms] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_TERMS_BY_PROJECT_ID, [[project_id, 0]]);

    // const terms = await termsRepository.find({
    //   where: {
    //     project_id: [project_id, 0]
    //   }
    // });
    const terms = await this.resourceTermsRepository
      .createQueryBuilder('terms')
      .where('terms.project_id in (:project_id)', {
        project_id: [project_id, 0],
      })
      .getMany();

    const data = await this.dealWithAllTermsToUnity(terms, project_id);
    return data;
  }
}
