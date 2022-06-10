import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageDataEditEntity } from 'src/entities';
import { Repository } from 'typeorm';
import {
  CreatePackageDataEditDto,
  UpdatePackageDataEditDto,
} from './dto/index.dto';

@Injectable()
export class PackageDataEditService {
  @InjectRepository(PackageDataEditEntity)
  private readonly packageDataEditRepository: Repository<PackageDataEditEntity>;

  /**
   * 创建数据编辑
   * @param param0
   * @param createPackageDataEditDto
   * @returns
   */
  async createPackageDataEdit(
    { project_id, user_id },
    createPackageDataEditDto: CreatePackageDataEditDto,
  ) {
    try {
      const packageDataEdit = await this.packageDataEditRepository.create({
        project_id,
        created_user: user_id,
        ...createPackageDataEditDto,
      });

      return await this.packageDataEditRepository.save(packageDataEdit);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByPageSize({ project_id }, { page, size, ...rest }) {
    const [data, count] = await this.packageDataEditRepository.findAndCount({
      where: { project_id, ...rest },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      data,
      count,
    };
  }

  async updatePackageDataEdit(
    { user_id },
    id: number,
    updatePackageDataEditDto: UpdatePackageDataEditDto,
  ) {
    try {
      const packageDataEdit = await this.packageDataEditRepository.create({
        id,
        created_user: user_id,
        ...updatePackageDataEditDto,
      });

      return await this.packageDataEditRepository.save(packageDataEdit);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deletePackageDataEdit(id: number) {
    try {
      await this.packageDataEditRepository.delete(id);
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
