import {
  Controller,
  Get,
  Param,
  Headers,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { CreateMinioDto } from './dtos/create-minio.dto';
import { UpdateMinioDto } from './dtos/update-minio.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('Minio')
@Controller('minio')
export class MinioClinentController {
  constructor(private readonly minioClientService: MinioClientService) {}

  // app.get('/presignedPostPolicy', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.minioService.presignedPostPolicy(req.session, req.query);
  //   }
  // });
  @Get('presignedPostPolicy')
  @ApiOperation({ summary: 'minio返回一个上传地址' })
  async presignedPostPolicy(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getMinioDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.minioClientService.presignedPostPolicy(user, getMinioDto);
  }

  // app.get('/presignedPostPolicy/:project_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.minioService.presignedPostPolicy(req.params, req.query);
  //   }
  // });
  @Get('presignedPostPolicy/:project_id')
  @ApiOperation({ summary: '根据项目返回上传地址' })
  async presignedPostPolicyByProjectId(
    @Request() req,
    @Param('project_id') project_id: string,
    @Query() getMinioDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.minioClientService.presignedPostPolicy(user, getMinioDto);
  }

  // app.get('/listObjects', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.minioService.getProjectAssetBundles(req.session, req.query);
  //   }
  // });
  @Get('listObjects')
  @ApiOperation({ summary: '获取项目所有的上传结果' })
  async getProjectAssetBundles(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getMinioDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.minioClientService.getProjectAssetBundles(
      user,
      getMinioDto,
    );
  }

  // app.get('/presignedGetObject', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.minioService.presignedGetObject(req.query);
  //   }
  // });
  @Get('presignedGetObject')
  @ApiOperation({ summary: '生成下载地址' })
  async presignedGetObject(@Query() getMinioDto: any) {
    return await this.minioClientService.presignedGetObject(getMinioDto);
  }

  // app.get('/presignedGetObject/file', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.minioService.presignedGetObject(req.query);
  //   }
  // })
  @Get('presignedGetObject/file')
  @ApiOperation({ summary: '对外的下载地址' })
  async presignedGetObject2(@Query() getMinioDto: any) {
    return await this.minioClientService.presignedGetObject(getMinioDto);
  }
}
