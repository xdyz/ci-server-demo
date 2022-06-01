import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResourceCategoryEntity,
  ResourceCategoryExtraEntity,
  ResourceInstanceItemsEntity,
  ResourceTermsEntity,
} from 'src/entities';
import { getConnection, Like, Repository } from 'typeorm';

@Injectable()
export class ResourceCategoryService {
  @InjectRepository(ResourceCategoryEntity)
  private readonly resourceCategoryRepository: Repository<ResourceCategoryEntity>;

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
   * 根据id 获取检查分类
   * @param {*} id
   * @returns
   */
  async getOneClassificationById(id) {
    const category = await this.resourceCategoryRepository.findOne(id);
    return category;
  }

  async getOneClassificationByUid(project_id, category_uid) {
    // const [classifications] = await app.mysql.query(resourceConstants.SELECT_RESOURCE_CATEGORY_BY_PROJECT_ID_AND_CATEGORY_UID, [project_id, category_uid]);
    const category = await this.resourceCategoryRepository.findOne({
      where: {
        project_id,
        category_uid,
      },
    });
    return category;
  }

  /**
   * 获取分类
   * @param {*} queries
   * @returns
   */

  async getResourceClassification({ project_id }, queries) {
    const params = this.dealWithQuery(queries);

    const result = await this.resourceCategoryRepository
      .createQueryBuilder('cate')
      .leftJoinAndMapOne(
        'cate.extra',
        'resource_category_extra',
        'extra',
        'extra.category_id = cate.id AND extra.project_id = :project_id',
        { project_id },
      )
      .where('cate.project_id = :project_id', { project_id })
      .andWhere('cate.project_id in (:ids)', { ids: [project_id, 0] })
      .andWhere(params)
      .select([
        'cate.id',
        'cate.category_uid',
        'cate.category_name',
        'cate.project_id',
        'extra.global_params',
      ])
      .orderBy('cate.id', 'DESC')
      .getMany();

    return result;
  }

  /**
   * 新增分类
   * @param {*} { category_uid, category_name, }
   * @returns
   */

  async insertClassification({ project_id }, createCategoryDto) {
    const hasRes = await this.getOneClassificationByUid(
      project_id,
      createCategoryDto.category_uid,
    );
    if (hasRes) {
      return {
        error: {
          message: '分类标识已存在',
        },
      };
    }

    try {
      const category = await this.resourceCategoryRepository.create({
        project_id,
        ...createCategoryDto,
      });
      const data = await this.resourceCategoryRepository.save(category);
      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新分类
   * @param {*} id
   * @param {*} { category_uid, category_name, }
   * @returns
   */

  async updateClassification(id, { category_uid, category_name }) {
    try {
      const hasRes = await this.getOneClassificationById(category_name);
      if (hasRes) {
        return {
          error: {
            message: `${category_name} 标识已存在`,
          },
        };
      }
      await this.resourceCategoryRepository.save({
        id,
        category_name,
        category_uid,
      });
      const data = await this.getOneClassificationById(id);
      return {
        data,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 删除检查分类 检查分类下的检查项也会一并删除
   * @param {number} id
   * @returns {}
   */
  async deleteClassification(id) {
    const data = await this.getOneClassificationById(id);

    if (!data) {
      throw new HttpException('分类不存在', HttpStatus.BAD_REQUEST);
    }

    const queryRunner = await getConnection().createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const terms = await queryRunner.manager.find(ResourceTermsEntity, {
        where: {
          category_id: id,
        },
      });
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        await queryRunner.manager.delete(ResourceInstanceItemsEntity, {
          term_id: term.id,
        });
      }
      await queryRunner.manager.delete(ResourceTermsEntity, {
        category_id: id,
      });
      await queryRunner.manager.delete(ResourceCategoryEntity, {
        id,
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

  async getOneCategoryExtra({ category_uid, category_id, project_id }) {
    const globalParams = await this.resourceCategoryExtraRepository.findOne({
      where: {
        project_id,
        category_uid,
        category_id,
      },
    });

    return globalParams;
  }

  async setClassificationExtra({ project_id }, createCategoryExtraDto) {
    try {
      const globalParams = await this.getOneCategoryExtra({
        category_uid: createCategoryExtraDto.category_uid,
        category_id: createCategoryExtraDto.category_id,
        project_id,
      });
      let result = null;
      if (globalParams) {
        result = await this.resourceCategoryExtraRepository.save({
          ...createCategoryExtraDto,
          project_id,
          id: globalParams.id,
        });
      } else {
        const extra = await this.resourceCategoryExtraRepository.create({
          ...createCategoryExtraDto,
          project_id,
        });
        result = await this.resourceCategoryExtraRepository.save(extra);
      }

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
