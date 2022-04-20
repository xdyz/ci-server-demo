import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { ProjectsService } from '../projects/projects.service';
import { MinioModule as MinioClientModule } from 'nestjs-minio-client';
@Module({
  imports: [
    MinioClientModule.register({
      endPoint: 's3.sofunny.io',
      port: 443,
      accessKey: 'FA188L0PIPP5ZZVFWA2N',
      secretKey: 'ECfuQEZ6mrDinTYw2C78lxdrUOBWYAYfsoZafvP1',
    }),
    ProjectsService,
  ],
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
