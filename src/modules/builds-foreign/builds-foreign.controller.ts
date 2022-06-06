import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioClientService } from 'src/modules/minio-client/minio-client.service';
import { BuildsForeignService } from './builds-foreign.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('构建对外接口')
@Controller('foreign')
export class BuildsForeignController {
  constructor(
    private readonly buildsForeignService: BuildsForeignService,
    private readonly minioClientService: MinioClientService,
  ) {}

  // 将文件上传至文件系统，并且返回其路径
  async uploadFileToMinio(file) {
    const result = {
      content: '',
      filePath: '',
    };
    try {
      if (!file) return result;
      const val = await file.toBuffer();
      const info = await val.toString();
      const { build_id, job_name, project_id } = info ? JSON.parse(info) : null;
      const filePath = await this.minioClientService.beforePutObject({
        val,
        projectId: Number(project_id),
        jobName: job_name,
        buildNumber: build_id,
        time: '',
      });

      return {
        content: info,
        filePath,
      };
    } catch (error) {
      console.log(error);
      return result;
    }
  }

  // app.post('/upload/result', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {

  //     const data = await req.file();

  //     // const { content, filename } = await saveResult(data);
  //     const { content, filePath } = await uploadFileToMinio(data);
  //     taskService.uploadResultBuild(JSON.parse(content), filePath);
  //     return '';
  //   }
  // });
  @Post('upload/result')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传打包的结果' })
  async uploadResultBuild(@UploadedFile() file: any) {
    const { content, filePath } = await this.uploadFileToMinio(file);
    this.buildsForeignService.uploadResultBuild(JSON.parse(content), filePath);
    return '';
  }

  // 将结果保存到本地文件中，然后输出文件内容
  // app.post('/upload/test_result', {
  //   handler: async (req) => {
  //     const data = await req.file();
  //     // const { content, filename } = await saveResult(data);
  //     const { content, filePath } = await uploadFileToMinio(data);
  //     taskService.uploadTestResultBuild(JSON.parse(content), filePath);
  //     return '';
  //   }
  // });
  @Post('upload/test_result')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传自动化测试的结果' })
  async uploadTestResultBuild(@UploadedFile() file: any) {
    const { content, filePath } = await this.uploadFileToMinio(file);
    this.buildsForeignService.uploadTestResultBuild(
      JSON.parse(content),
      filePath,
    );
    return '';
  }

  // 服务器结果文件上传
  // app.post('/upload/server_result', {
  //   handler: async (req) => {
  //     const data = await req.file();
  //     // const { content, filename } = await saveResult(data);

  //     const { content, filePath } = await uploadFileToMinio(data);
  //     taskService.uploadServerResultBuild(JSON.parse(content), filePath);
  //     return '';
  //   }
  // });
  @Post('upload/server_result')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '上传服务器测试的结果' })
  async uploadServerResultBuild(@UploadedFile() file: any) {
    const { content, filePath } = await this.uploadFileToMinio(file);
    this.buildsForeignService.uploadServerResultBuild(
      JSON.parse(content),
      filePath,
    );
    return '';
  }

  // app.post('/upload/result_file', {
  //   // preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const data = await req.file();
  //     const { build_type } = req.query;
  //     // const { content, filename } = await saveResult(data, build_type);
  //     const { content, filePath } = await uploadFileToMinio(data);
  //     // 上传类型不同，处理数据不同
  //     switch (build_type) {
  //       case 'package':
  //         taskService.uploadResultBuild(JSON.parse(content), filePath);
  //         break;
  //       case 'test':
  //         taskService.uploadTestResultBuild(JSON.parse(content), filePath);
  //         break;
  //       case 'server':
  //         taskService.uploadServerResultBuild(JSON.parse(content), filePath);
  //         break;
  //       default:
  //         break;
  //     }
  //     return '';
  //   }
  // });
  @Post('upload/result_file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: '对外构建结构 多个接口合一' })
  async uploadResultBuild2(
    @UploadedFile() file: any,
    @Query('build_type') build_type: string,
  ) {
    const { content, filePath } = await this.uploadFileToMinio(file);
    switch (build_type) {
      case 'package':
        this.buildsForeignService.uploadResultBuild(
          JSON.parse(content),
          filePath,
        );
        break;
      case 'test':
        this.buildsForeignService.uploadTestResultBuild(
          JSON.parse(content),
          filePath,
        );
        break;
      case 'server':
        this.buildsForeignService.uploadServerResultBuild(
          JSON.parse(content),
          filePath,
        );
        break;
      default:
        break;
    }
    return '';
  }
}
