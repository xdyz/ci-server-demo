import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GitInfoService } from './git-info.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('Git 配置')
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
  @ApiOperation({ summary: '更新Git配置' })
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
  @ApiOperation({ summary: '删除Git配置' })
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
  @ApiOperation({ summary: '新建Git配置' })
  async createGitInfo(
    @Headers('project_id') project_id: string,
    @Body() createGitInfoDto: any,
  ) {
    return await this.gitInfoService.createGitInfo(
      { project_id: +project_id },
      createGitInfoDto,
    );
  }

  // app.get('/', {
  //     preHandler: app.verifyAuthorization,
  //     handler: async (req) => {
  //         return await app.services.gitInfoService.getGitInfos(req.session);
  //     }
  // });
  @Get()
  @ApiOperation({ summary: '获取Git配置' })
  async getGitInfos(@Headers('project_id') project_id: string) {
    return await this.gitInfoService.getGitInfos({ project_id: +project_id });
  }

  // app.get('/:id/branchs', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.gitInfoService.getGitInfoBranches(req.params.id);
  //   }
  // });
  @Get(':id/branchs')
  @ApiOperation({ summary: '获取Git配置所有分支' })
  async getGitInfoBranches(@Param('id') id: string) {
    return await this.gitInfoService.getGitInfoBranches(+id);
  }
}
