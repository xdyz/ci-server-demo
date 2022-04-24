import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParameterCoverageEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateParameterCoverageDto } from './dtos/create-parameter-coverage.dto';
import { UpdateParameterCoverageDto } from './dtos/update-parameter-coverage.dto';

@Injectable()
export class ParameterCoverageService {
  @InjectRepository(ParameterCoverageEntity)
  private readonly parameterCoverageRepository: Repository<ParameterCoverageEntity>;

  async getOneParameterCoverage(id) {
    // const [ result ] = await app.mysql.query(parameterCoverageConstants.SELECT_PARAMETER_COVERAGE_BY_ID, [ id ]);
    const result = await this.parameterCoverageRepository.findOne(id);
    return result;
  }

  // Get all parameter coverage
  async getParameterCoverage({ project_id }) {
    // const [ paramters ] = await app.mysql.query(parameterCoverageConstants.SELECT_PARAMETER_COVERAGE_BY_PROJECT_ID, [ project_id ]);
    const paramters = await this.parameterCoverageRepository.find({
      where: {
        project_id,
      },
    });

    return {
      data: paramters,
    };
  }

  // 更新参数覆盖率
  async updateParameterCoverage(id, updateParameterCoverageDto) {
    try {
      const result = await this.parameterCoverageRepository.save({
        id,
        ...updateParameterCoverageDto,
      });
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 新增参数覆盖率事务
  async createParameterCoverage(
    { project_id, user_id },
    createParameterCoverageDto,
  ) {
    try {
      const parameters = await this.parameterCoverageRepository.create({
        project_id,
        user_id,
        ...createParameterCoverageDto,
      });
      const result = await this.parameterCoverageRepository.save(parameters);

      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 删除参数覆盖事务
  async deleteParameterCoverage(id) {
    try {
      await this.parameterCoverageRepository.delete(id);
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
