import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { ProjectsService } from '../projects/projects.service';

import { ConfigService } from '@nestjs/config';
@Module({
  imports: [ProjectsService],
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
