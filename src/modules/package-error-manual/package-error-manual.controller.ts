import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Request,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PackageErrorManualService } from './package-error-manual.service';
import {
  CreatePackageErrorManualDto,
  UpdatePackageErrorManualDto,
} from './dtos/index.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('打包错误手册')
@Controller('package-error-manual')
export class PackageErrorManualController {
  constructor(
    private readonly packageErrorManualService: PackageErrorManualService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageErrorManualService.getManualErrors(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '分页获取安装包错误配置' })
  async getManualErrors(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageErrorManualDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.getManualErrors(
      user,
      getPackageErrorManualDto,
    );
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.packageErrorManualService.setManualError(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建安装包错误配置' })
  async setManualError(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createPackageErrorManualDto: CreatePackageErrorManualDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.setManualError(
      user,
      createPackageErrorManualDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.packageErrorManualService.updateManualError(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新安装包错误配置' })
  async updateManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updatePackageErrorManualDto: UpdatePackageErrorManualDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.updateManualError(
      id,
      updatePackageErrorManualDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageErrorManualService.deleteManualError(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除安装包错误配置' })
  async deleteManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.deleteManualError(+id);
  }

  // app.get('/ids', {
  //   preHandler:  app.verifyAuthorization,
  //   handler: async (req) => {
  //     let { ids } = req.query;
  //     ids = ids ? ids.split(',').map(item => Number(item)): [];
  //     return await app.services.packageErrorManualService.getManualErrorsByIds(req.session, ids);
  //   }
  // });
  @Get('ids')
  @ApiOperation({ summary: '根据多id获取安装包错误配置' })
  async getManualErrorsByIds(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query('ids') ids: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    const idsArr = ids ? ids.split(',').map((item) => Number(item)) : [];
    return await this.packageErrorManualService.getManualErrorsByIds(
      user,
      idsArr,
    );
  }

  // app.get('/all', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageErrorManualService.getAllErrorsManuals(req.session);
  //   }
  // });
  @Get('all')
  @ApiOperation({ summary: '获取所有安装包错误配置' })
  async getAllErrorsManuals(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.getAllErrorsManuals(user);
  }
}
