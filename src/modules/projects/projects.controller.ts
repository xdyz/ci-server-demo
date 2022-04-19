import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getAllProjects() {
    return await this.projectsService.getAllProjects();
  }

  @Post()
  async insertProject(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.insertProject(createProjectDto);
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  async delProject(@Param('id') id: number) {
    return await this.projectsService.delProject(id);
  }

  // 更新头像地址  这个可以替换上面update的方法 后面替换掉
  @Put('image/:id')
  async uploadProjectImage(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectsService.uploadProjectImage(id, updateProjectDto);
  }
}