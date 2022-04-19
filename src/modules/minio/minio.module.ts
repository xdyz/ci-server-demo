import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { ProjectsService } from '../projects/projects.service';

@Module({
  exports: [ProjectsService],
  controllers: [MinioController],
  providers: [MinioService],
})
export class MinioModule {}
