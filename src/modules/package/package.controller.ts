import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dtos/create-package.dto';
import { UpdatePackageDto } from './dtos/update-package.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('安装包')
@Controller('package')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getPackages(req.session, req.query);
  //   }
  // });
  @Get()
  async getPackages(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getPackages(user, getPackageDto);
  }

  // app.get('/:build_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const { build_id } = req.params;
  //     const buildId = parseInt(build_id);
  //     return await app.services.packageService.getPackageDetail(buildId);
  //   }
  // });
  @Get(':id')
  async getPackageDetail(
    // @Request() req,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user };
    return await this.packageService.getPackageDetail(+id);
  }

  // app.get('/report/duration', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getPackageReportDuration(req.session, req.query);
  //   }
  // });
  @Get('report/duration')
  async getPackageReportDuration(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getPackageReportDuration(
      user,
      getPackageDto,
    );
  }

  // app.get('/report/pass_rate', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getPackageReportRate(req.session, req.query);
  //   }
  // });
  @Get('report/pass_rate')
  async getPackageReportRate(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getPackageReportRate(user, getPackageDto);
  }

  // app.get('/report/result', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const { project_id } = req.session;
  //     return await app.services.packageService.getPackageReportResult({ ...req.query, project_id });
  //   }
  // });
  @Get('report/result')
  async getPackageReportResult(
    // @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getPackageReportResult({
      project_id: +project_id,
      ...getPackageDto,
    });
  }

  // app.get('/report/result/noauth', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {

  //     const query = await app.utils.parseTimeToSeconds(req.query);
  //     return await app.services.packageService.getPackageReportResult(query);
  //   }
  // });
  @Get('report/result/noauth')
  async getPackageReportResultNoAuth(@Query() getPackageDto: any) {
    return await this.packageService.getPackageReportResult(getPackageDto);
  }

  // app.get('/report/category', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getPackageReportCategory(req.session, req.query);
  //   }
  // });
  @Get('report/category')
  async getPackageReportCategory(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getPackageReportCategory(
      user,
      getPackageDto,
    );
  }

  // app.get('/check/:build_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const { build_id } = req.params;
  //     const buildId = parseInt(build_id);
  //     return await packageService.getPackageCheckResult(buildId);
  //   }
  // });

  // app.get('/report/failure_history', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getFailureHistoryData(req.session, req.query);
  //   }
  // });
  @Get('report/failure_history')
  async getFailureHistoryData(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getFailureHistoryData(user, getPackageDto);
  }

  // app.get('/report/top_five', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getTopFiveErrorManuals(req.session, req.query);
  //   }
  // });
  @Get('report/top_five')
  async getTopFiveErrorManuals(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getTopFiveErrorManuals(
      user,
      getPackageDto,
    );
  }

  // app.get('/build/jenkin_unity/manuals', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageService.getJenkinsAndUnityManuals(req.session, req.query);
  //   }
  // });
  @Get('build/jenkin_unity/manuals')
  async getJenkinsAndUnityManuals(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageService.getJenkinsAndUnityManuals(
      user,
      getPackageDto,
    );
  }
}
