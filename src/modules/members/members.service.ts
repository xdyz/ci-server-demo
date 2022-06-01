import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembersEntity } from 'src/entities';
import { Like, Repository } from 'typeorm';
import { CreateMemberDto } from './dtos/create-member.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';

@Injectable()
export class MembersService {
  @InjectRepository(MembersEntity)
  private readonly membersRepository: Repository<MembersEntity>;

  // 将查询接口的参数处理成需要的
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
  // };

  async getOneMemberById(id) {
    // const [ members ] = await app.mysql.query(membersConstants.SELECT_MEMBERS_BY_ID, [ id ]);

    const member = await this.membersRepository
      .createQueryBuilder('m')
      .where('id = :id', { id })
      .leftJoinAndMapOne('m.user', 'UsersEntity', 'u', 'm.userId = u.id')
      .leftJoinAndMapOne('m.role', 'RolesEntity', 'r', 'm.roleId = r.id')
      .getOne();
    return member;
  }

  async getMembers({ project_id, ...rest }) {
    const queries = this.dealWithQuery({ ...rest });
    const data = await this.membersRepository
      .createQueryBuilder('m')
      .where('project_id = :project_id', { project_id })
      .andWhere(queries)
      .leftJoinAndMapOne('m.user', 'UsersEntity', 'u', 'm.userId = u.id')
      .leftJoinAndMapOne('m.role', 'RolesEntity', 'r', 'm.roleId = r.id')
      .getMany();

    return data;
  }

  async getProjectAdmin(project_id) {
    const members = await this.membersRepository
      .createQueryBuilder('m')
      .leftJoinAndMapOne('m.user', 'UsersEntity', 'u', 'm.userId = u.id')
      .leftJoinAndMapOne('m.role', 'RolesEntity', 'r', 'm.roleId = r.id')
      .orderBy('m.created_at', 'DESC')
      .where('project_id = :project_id AND r.project_root = :project_root', {
        project_id,
        project_root: 1,
      })
      .getMany();

    return members;
  }

  /**
   * 新建成员
   * @param {*} param0
   * @returns
   */
  async insertMember(createMemberCto) {
    try {
      const member = await this.membersRepository.create(createMemberCto);
      const result = await this.membersRepository.save(member);
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 更新成员
   * @param {*} param0
   * @returns
   */
  async updateMember(id, updateMemberDto) {
    try {
      const result = await this.membersRepository.save({
        id,
        ...updateMemberDto,
      });
      const data = await this.getOneMemberById(result.id);
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delMember(id) {
    try {
      await this.membersRepository.delete(id);
      return;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
