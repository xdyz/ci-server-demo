import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  Headers,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JenkinsInfoService } from './jenkins-info.service';
import { CreateJenkinsInfoDto } from './dtos/create-jenkins-info.dto';
import { UpdateJenkinsInfoDto } from './dtos/update-jenkins-info.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('Jenkins配置')
@Controller('jenkins-info')
export class JenkinsInfoController {
  constructor(private readonly jenkinsInfoService: JenkinsInfoService) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.jenkinsInfoService.getAllJenkinsInfo(req.session);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取Jenkins配置' })
  async getAllJenkinsInfo(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.jenkinsInfoService.getAllJenkinsInfo(user);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.jenkinsInfoService.createJenkinsInfo(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建Jenkins配置' })
  async createJenkinsInfo(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createJenkinsInfoDto: CreateJenkinsInfoDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.jenkinsInfoService.createJenkinsInfo(
      user,
      createJenkinsInfoDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.jenkinsInfoService.updateJenkinsInfo(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新Jenkins配置' })
  async updateJenkinsInfo(
    // @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updateJenkinsInfoDto: UpdateJenkinsInfoDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.jenkinsInfoService.updateJenkinsInfo(
      id,
      updateJenkinsInfoDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.jenkinsInfoService.deleteJenkinsInfo(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除Jenkins配置' })
  async deleteJenkinsInfo(
    // @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.jenkinsInfoService.deleteJenkinsInfo(id);
  }
}
