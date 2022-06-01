import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TestErrorManualEntity } from 'src/entities';
import { In, Like, Repository } from 'typeorm';
import { CreateTestErrorManualDto } from './dtos/create-test-error-manual.dto';
import { UpdateTestErrorManualDto } from './dtos/update-test-error-manual.dto';

@Injectable()
export class TestErrorManualService {
  @InjectRepository(TestErrorManualEntity)
  private readonly testErrorManualRepository: Repository<TestErrorManualEntity>;

  dealWithQuery = (params = {}) => {
    const result = {};
    Object.keys(params).forEach((key) => {
      const val = params[key];
      if (val) {
        result[key] = Like(`%${val}%`);
      }
    });

    return result;
  };

  async getManualErrors({ project_id }, { page, size, ...rest }) {
    const params = this.dealWithQuery(rest);
    const [data, total] = await this.testErrorManualRepository
      .createQueryBuilder('t')
      .where('t.project_id = :project_id', { project_id })
      .andWhere(params)
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    return {
      data,
      total,
    };
  }

  async getAllManualErrors({ project_id }) {
    // const [manuals] = await app.mysql.query(testErrorManualConstants.SELECT_TEST_ERROR_MANUAL_BY_PROJECT_ID, [project_id]);
    const data = await this.testErrorManualRepository.find({
      where: {
        project_id,
      },
    });

    return data;
  }
  // { error_code, problem, solution, tags }
  async setManualError({ project_id }, createManualErroDto) {
    try {
      const manual = await this.testErrorManualRepository.create({
        ...createManualErroDto,
        project_id,
      });
      const data = await this.testErrorManualRepository.save(manual);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //{ error_code, problem, solution, tags }
  async updateManualError(id, updateManualErrorDto) {
    try {
      const data = await this.testErrorManualRepository.save({
        id,
        ...updateManualErrorDto,
      });
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteManualError(id) {
    try {
      // const [manuals] = await app.mysql.query(testErrorManualConstants.SELECT_TEST_ERROR_MANUAL_BY_ID, [id]);
      const manual = await this.testErrorManualRepository.findOne(id);
      if (!manual) {
        throw new HttpException('找不到该错误码', HttpStatus.BAD_REQUEST);
      }
      // await app.mysql.query(testErrorManualConstants.DELETE_TEST_ERROR_MANUAL_BY_ID, [id]);
      await this.testErrorManualRepository.delete(id);

      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getManualErrorsByIds({ project_id }, ids) {
    let manuals = [];
    if (ids.length !== 0) {
      // [manuals] = await app.mysql.query(testErrorManualConstants.SELECT_TEST_ERROR_MANUAL_BY_IDS, [ids]);
      manuals = await this.testErrorManualRepository.find({
        where: {
          id: In(ids),
          project_id,
        },
      });
    } else {
      // [manuals] = await app.mysql.query(testErrorManualConstants.SELECT_TEST_ERROR_MANUAL_BY_PROJECT_ID_AND_ERROR_CODE, [project_id, '未知错误']);
      manuals = await this.testErrorManualRepository.find({
        where: {
          project_id,
          error_code: '未知错误',
        },
      });
    }
    return manuals;
  }

  async getManualErrorsByErrorCode(error_code, project_id) {
    // const [manuals] = await app.mysql.query(testErrorManualConstants.SELECT_TEST_ERROR_MANUAL_BY_PROJECT_ID_AND_ERROR_CODE, [project_id, error_code]);
    const data = await this.testErrorManualRepository.findOne({
      where: {
        error_code,
        project_id,
      },
    });
    return data;
  }
}
