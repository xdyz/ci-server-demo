import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';
import { MinioController } from './minio.controller';
import { ProjectsService } from '../projects/projects.service';
import { MinioModule as MinioClientModule } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';
@Module({
  imports: [
    MinioClientModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('minio'),
    }),
    ProjectsService,
  ],
  controllers: [MinioController],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
