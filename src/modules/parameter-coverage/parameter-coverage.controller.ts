import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Request,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ParameterCoverageService } from './parameter-coverage.service';
import {
  CreateParameterCoverageDto,
  UpdateParameterCoverageDto,
} from './dtos/index.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('参数覆盖')
@Controller('parameter-coverage')
export class ParameterCoverageController {
  constructor(
    private readonly parameterCoverageService: ParameterCoverageService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.getParameterCoverage(req.session);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取参数覆盖' })
  async getParameterCoverage(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.getParameterCoverage(user);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.createParameterCoverage(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建参数覆盖' })
  async createParameterCoverage(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createParameterCoverageDto: CreateParameterCoverageDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.createParameterCoverage(
      user,
      createParameterCoverageDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.updateParameterCoverage(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新参数覆盖' })
  async updateParameterCoverage(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updateParameterCoverageDto: UpdateParameterCoverageDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.updateParameterCoverage(
      id,
      updateParameterCoverageDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.deleteParameterCoverage(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除参数覆盖' })
  async deleteParameterCoverage(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.deleteParameterCoverage(+id);
  }
}
