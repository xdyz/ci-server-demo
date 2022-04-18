import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { GitInfoService } from './git-info.service';

@Controller('git-info')
export class GitInfoController {
  constructor(private readonly gitInfoService: GitInfoService) {}

  // const { gitInfoService } = app.services
  //   app.put('/:id', {
  //     preHandler: app.verifyAuthorization,
  //     handler: async (req) => {
  //         return await app.services.gitInfoService.updateGitInfo(req.params.id, req.body);
  //     }
  // });
  @Put(':id')
  async updateGitInfo(@Param('id') id: string, @Body() updateGitInfoDto: any) {
    return await this.gitInfoService.updateGitInfo(+id, updateGitInfoDto);
  }

  // app.delete('/:id', {
  //     preHandler: app.verifyAuthorization,
  //     handler: async (req) => {
  //         return await app.services.gitInfoService.deleteGitInfo(req.params.id);
  //     }
  // });
  @Delete(':id')
  async deleteGitInfo(@Param('id') id: string) {
    return await this.gitInfoService.deleteGitInfo(+id);
  }

  // app.post('/', {
  //     preHandler: app.verifyAuthorization,
  //     handler: async (req) => {
  //         return await app.services.gitInfoService.createGitInfo(req.session, req.body);
  //     }
  // });
  @Post()
  async createGitInfo(@Body() createGitInfoDto: any) {
    return await this.gitInfoService.createGitInfo(createGitInfoDto);
  }

  // app.get('/', {
  //     preHandler: app.verifyAuthorization,
  //     handler: async (req) => {
  //         return await app.services.gitInfoService.getGitInfos(req.session);
  //     }
  // });
  @Get()
  async getGitInfos() {
    return await this.gitInfoService.getGitInfos();
  }

  // app.get('/:id/branchs', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.gitInfoService.getGitInfoBranches(req.params.id);
  //   }
  // });
  @Get(':id/branchs')
  async getGitInfoBranches(@Param('id') id: string) {
    return await this.gitInfoService.getGitInfoBranches(+id);
  }
}
