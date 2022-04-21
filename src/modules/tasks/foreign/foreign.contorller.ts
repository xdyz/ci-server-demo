import { Controller, Inject, Post, Query } from '@nestjs/common';
import { MinioService } from 'src/modules/minio/minio.service';
import { TasksForeignService } from './foreign.service';

@Controller('foreign')
export class TasksForeignController {
  @Inject()
  private readonly tasksForeignService: TasksForeignService;

  @Inject()
  private readonly minioService: MinioService;

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
      const filePath = await this.minioService.beforePutObject({
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
  async uploadResultBuild() {
    const { content, filePath } = await this.uploadFileToMinio(body.file);
    this.tasksForeignService.uploadResultBuild(JSON.parse(content), filePath);
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
  async uploadTestResultBuild() {
    const { content, filePath } = await this.uploadFileToMinio(body.file);
    this.tasksForeignService.uploadTestResultBuild(
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
  async uploadServerResultBuild() {
    const { content, filePath } = await this.uploadFileToMinio(body.file);
    this.tasksForeignService.uploadServerResultBuild(
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
  async uploadResultBuild2(@Query('build_type') build_type: string) {
    const { content, filePath } = await this.uploadFileToMinio(body.file);
    switch (build_type) {
      case 'package':
        this.tasksForeignService.uploadResultBuild(
          JSON.parse(content),
          filePath,
        );
        break;
      case 'test':
        this.tasksForeignService.uploadTestResultBuild(
          JSON.parse(content),
          filePath,
        );
        break;
      case 'server':
        this.tasksForeignService.uploadServerResultBuild(
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
