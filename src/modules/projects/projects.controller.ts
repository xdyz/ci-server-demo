import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('项目')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有项目' })
  async getAllProjects() {
    return await this.projectsService.getAllProjects();
  }

  @Post()
  @ApiOperation({ summary: '新建项目' })
  async insertProject(@Body() createProjectDto: CreateProjectDto) {
    return await this.projectsService.insertProject(createProjectDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目' })
  async updateProject(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectsService.updateProject(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  async delProject(@Param('id') id: number) {
    return await this.projectsService.delProject(id);
  }

  // 更新头像地址  这个可以替换上面update的方法 后面替换掉
  @Put('image/:id')
  @ApiOperation({ summary: '上传项目图片' })
  async uploadProjectImage(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return await this.projectsService.uploadProjectImage(id, updateProjectDto);
  }
}
