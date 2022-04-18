import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsEntity } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  @InjectRepository(ProjectsEntity)
  private readonly projectsRepository: Repository<ProjectsEntity>;

  findOneProjectById = async (id) => {
    const project = await this.projectsRepository.findOne({
      where: {
        id,
        is_del: 0,
      },
    });

    return project;
  };

  /**
   * 获取单个项目信息
   * @param {*} id
   * @returns
   */
  async getOneProject(id) {
    const project = await this.findOneProjectById(id);
    return {
      data: project,
    };
  }

  /**
   * 获取所有的项目列表
   * @returns []
   */
  async getAllProjects() {
    // const [projects] = await app.mysql.query(projectsConstants.SELECT_PROJECTS_BY_IS_DEL, [0]);
    const projects = await this.projectsRepository.find({
      where: {
        is_del: 0,
      },
    });

    return {
      data: projects,
    };
  }

  /**
   * 新增项目
   * @param {name} param0
   * @returns
   */
  async insertProject(createProjectDto) {
    try {
      const project = await this.projectsRepository.save({
        is_del: 0,
        ...createProjectDto,
      });
      const result = await this.projectsRepository.save(project);
      return {
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 更新项目
   * @param {name} param0
   * @returns
   */
  async updateProject(id, updateProjectDto) {
    try {
      const result = await this.projectsRepository.save({
        id,
        ...updateProjectDto,
      });
      return {
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 删除项目
   * @param {id} number
   * @returns
   */
  async delProject(id) {
    try {
      await this.projectsRepository.save({ id, is_del: 1 });
      return {};
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 上传图片
   * @param {*} id
   * @param {*} image_url
   * @returns
   */
  async uploadProjectImage(id, updateProjectDto) {
    try {
      const result = await this.projectsRepository.save({
        id,
        ...updateProjectDto,
      });
      return {
        data: result,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
