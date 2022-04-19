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
} from '@nestjs/common';
import { JenkinsInfoService } from './jenkins-info.service';
import { CreateJenkinsInfoDto } from './dtos/create-jenkins-info.dto';
import { UpdateJenkinsInfoDto } from './dtos/update-jenkins-info.dto';

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
  async updateJenkinsInfo(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updateJenkinsInfoDto: UpdateJenkinsInfoDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
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
  async deleteJenkinsInfo(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.jenkinsInfoService.deleteJenkinsInfo(id);
  }
}
