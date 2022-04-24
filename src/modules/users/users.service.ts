import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { UsersEntity } from 'src/entities';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';

@Injectable()
export class UsersService {
  sentryClient: any;
  constructor(@InjectSentry() private readonly sentryService: SentryService) {
    this.sentryClient = sentryService.instance();
  }

  @InjectRepository(UsersEntity)
  private readonly usersRepository: Repository<UsersEntity>;

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

  async findOneByName(username: string): Promise<any> {
    return await this.usersRepository.findOne({ username });
  }

  // const getProjectsRole = async (data) => {
  //   if (data.length === 0) return [];
  //   const proRoles = await Promise.all(data.map(async (item) => {
  //     const [roles] = await app.mysql.query(rolesConstants.SELECT_ROLES_BY_ID, [item.role_id]);
  //     const [projects] = await app.mysql.query(projectsConstants.SELECT_PROJECT_BY_ID, [item.project_id, 0]);
  //     return {
  //       ...item,
  //       role: roles[0],
  //       project_info: projects[0]
  //     };
  //   }));

  //   return proRoles;
  // };

  /**
   * 给每一个用户挂上项目
   * @param {[]} data
   * @returns
   */
  // const getUsersProjects = async (data) => {
  //   let userProRoles = [];
  //   if (data.length === 0) return userProRoles;
  //   try {
  //     userProRoles = await Promise.all(data.map(async (item) => {
  //       const [userPros] = await app.mysql.query(membersConstants.SELECT_MEMBERS_BY_USER_ID, [item.id]);
  //       const prosRole = await getProjectsRole(userPros);
  //       return {
  //         ...item,
  //         projects: prosRole
  //       };
  //     }));
  //   } catch (error) {
  //     return userProRoles;
  //   }

  //   return userProRoles;
  // };

  async getUser(userId) {
    const user = await this.usersRepository
      .createQueryBuilder('u')
      .where('u.id = :id', { id: userId })
      .leftJoinAndMapOne('u.role', 'roles', 'r', 'u.role_id = r.id')
      .leftJoinAndMapOne(
        'u.project',
        'projects',
        'p',
        'u.project_id = p.id AND p.is_del =:is_del',
        { is_del: 0 },
      )
      .getOne();
    if (!user) {
      throw new HttpException('找不到该用户', HttpStatus.OK);
    }
    // const user = await getUsersProjects(users);

    return user;
  }

  async getUsers({ page, size }) {
    const [list, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * size || 1,
      take: size || 10,
    });
    return {
      list,
      total,
    };
  }

  async updateUser(id, updateUserDto) {
    try {
      const data = await this.usersRepository.save({ id, ...updateUserDto });
      return data;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUser(id) {
    // const [users] = await app.mysql.query(usersConstants.SELECT_ONE_USER_BY_ID, [userId]);
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new HttpException('找不到该用户', HttpStatus.OK);
    }
    // await app.mysql.query(usersConstants.DELETE_USER_BY_ID, [userId]);
    await this.usersRepository.delete(id);
    return {};
  }

  // { password, username, nickname, email, is_root }
  async createUser(createUserDto) {
    try {
      const user = await this.usersRepository.create(createUserDto);
      const data = await this.usersRepository.save(user);
      return data;
    } catch (error) {
      // app.sentry.captureException(error);
      this.sentryClient.captureException(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 获取所有的用户
  async getAllUsers(quires) {
    const params = this.dealWithQuery(quires);
    // const whereSql = queryKeys.length !== 0 ? `WHERE ${queryKeys.join(' AND ')}` : '';
    // const [users] = await app.mysql.query(`${usersConstants.SELECT_USERS_NO_CONDITION} ${whereSql}`, queryValues);
    const users = await this.usersRepository.find({
      where: params,
    });

    return users;
  }
}
