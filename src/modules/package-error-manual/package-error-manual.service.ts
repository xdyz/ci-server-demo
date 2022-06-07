import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageErrorManualEntity } from 'src/entities';
import { In, Like, Repository } from 'typeorm';
import {
  CreatePackageErrorManualDto,
  UpdatePackageErrorManualDto,
} from './dtos/index.dto';

@Injectable()
export class PackageErrorManualService {
  @InjectRepository(PackageErrorManualEntity)
  private readonly packageErrorManualRepository: Repository<PackageErrorManualEntity>;

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

  async getOneManualErrorById(id) {
    const manual = await this.packageErrorManualRepository.find({
      where: {
        id,
      },
    });
    return manual;
  }

  async getManualsByProjectIdAndTags({ project_id, tags = [] }) {
    const manuals = await this.packageErrorManualRepository
      .createQueryBuilder('b')
      .where('b.project_id = :project_id', { project_id })
      .andWhere({
        tags: In(tags),
      })
      .getMany();

    return manuals;
  }

  async getManualErrors({ project_id }, { page, size, ...rest }) {
    try {
      const queries = this.dealWithQuery(rest);
      const [manuals, count] = await this.packageErrorManualRepository
        .createQueryBuilder('pme')
        .where('pme.project_id = :project_id', { project_id })
        .andWhere(queries)
        .offset((page - 1) * size)
        .limit(size)
        .orderBy('pme.id', 'DESC')
        .getManyAndCount();

      const data = manuals.map((item) => {
        return {
          ...item,
          tags: item.tags ? item.tags.split(',') : [],
        };
      });

      return {
        data,
        total: count,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // tags 字段改为 json 类型
  async setManualError({ project_id }, createManualError) {
    try {
      const manual = await this.packageErrorManualRepository.create({
        project_id,
        ...createManualError,
      });
      const result = await this.packageErrorManualRepository.save(manual);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateManualError(id, updateManualError) {
    try {
      const result = await this.packageErrorManualRepository.save({
        id,
        ...updateManualError,
      });
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteManualError(id) {
    try {
      await this.packageErrorManualRepository.delete(id);
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getManualErrorsByIds({ project_id }, ids) {
    let manuals = [];

    // const
    if (ids.length !== 0) {
      manuals = await this.packageErrorManualRepository.findByIds(ids);
    } else {
      manuals = await this.packageErrorManualRepository.find({
        where: {
          project_id,
          key_words: '未知错误',
        },
      });
    }

    return manuals;
  }

  async getAllErrorsManuals({ project_id }) {
    // const [manuals] = await app.mysql.query(packageErrorManualConstants.SELECT_PACKAGE_ERROR_MANUAL_BY_PROJECT_ID, [project_id]);
    const manuals = await this.packageErrorManualRepository.find({
      where: {
        project_id,
      },
    });
    return manuals;
  }
}
