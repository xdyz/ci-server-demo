import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceCategoryEntity, ResourceInstanceItemsEntity, ResourceTermsEntity } from 'src/entities';
import { getConnection, Like, Repository } from 'typeorm';

@Injectable()
export class ResourceTermsService {
  @InjectRepository(ResourceTermsEntity)
  private readonly resourceTermsRepository: Repository<ResourceTermsEntity>;

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

          const cateData = await queryRunner.manager.findOne(ResourceCategoryEntity,{
            select: ['id','category_uid'],
            where: {
              project_id,
              category_uid,
            },
          });
          if (cateData) {
            cates = cateData.id;
          } else {
            const cate = await queryRunner.manager.save(
              new ClassificationEntity({
                project_id,
                category_uid,
                category_name,
              }),
            );
            cates = cate.id;
          }
        }
          })
          if (!cateData) {
            cates = await resourceService.insertClassification(
              { project_id },
              { category_uid, category_name },
            );
          }

          if (el.detect_paths) {
            el.detect_paths = el.detect_paths.join(',');
          }
          if (el.filter_paths) {
            el.filter_paths = el.filter_paths.join(',');
          }
          el.category_id = cateData ? cateData.id : cates.data.id;
          if (el.rule_uid) {
            const hasTerm = await this.getOneResourceTermByUid(
              { project_id },
              el.rule_uid,
            );
            if (!hasTerm) {
              await this.insertResourceTerms({ project_id }, el);
            }
          }
        }
      }

      if (params && params.length !== 0) {
        for (let x = 0; x < params.length; x++) {
          const pars = params[x];
          const cateData = await getOneClassificationByUid(
            project_id,
            pars.category_uid,
          );
          await resourceService.setClassificationExtra(
            { project_id },
            {
              category_id: cateData.id,
              category_uid: pars.category_uid,
              global_params: pars.global_params,
            },
          );
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
}
