import { Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioClinentController } from './minio-client.controller';
import { ProjectsService } from '../projects/projects.service';
import { MinioService } from 'nestjs-minio-client';
@Module({
  imports: [],
  controllers: [MinioClinentController],
  providers: [MinioClientService, ProjectsService, MinioService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
