import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';

@Injectable()
export class RolesService {
  @InjectRepository(RolesEntity)
  private readonly rolesRepository: Repository<RolesEntity>;

  async getRole(id) {
    const role = await this.rolesRepository.findOne({
      where: {
        id,
      },
    });
    return role;
  }

  async getRoles({ project_id, page, size }) {
    const [data, total] = await this.rolesRepository.findAndCount({
      where: { project_id },
      order: { id: 'DESC' },
      take: size,
      skip: (page - 1) * size,
    });
    return {
      data,
      total,
    };
  }

  // { name, privileges, project_root }
  async updateRole(id, updateRoleDto) {
    try {
      const role = await this.rolesRepository.save({ id, ...updateRoleDto });
      return role;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteRole(id) {
    try {
      await this.rolesRepository.delete(id);
      return {};
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // { name, privileges, project_root, project_id }
  async createRole(createRoleDto) {
    try {
      const role = await this.rolesRepository.create(createRoleDto);
      const data = await this.rolesRepository.save(role);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllRoles({ project_id }) {
    const data = await this.rolesRepository.find({
      where: { project_id },
      order: { id: 'DESC' },
    });

    return data;
  }
}
