import { Module } from '@nestjs/common';
import { BuildsForeignService } from './builds-foreign.service';
import { BuildsForeignController } from './builds-foreign.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BuildsEntity,
  GitInfoEntity,
  JenkinsInfoEntity,
  PackageErrorManualEntity,
  PipelineRecordsEntity,
  ProjectsEntity,
  TasksEntity,
  UsersEntity,
} from 'src/entities';
import { SentryService } from '@ntegral/nestjs-sentry';
import { BuildsService } from '../builds/builds.service';
import { WsService } from '../websocket/ws.service';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { TasksService } from '../tasks/tasks.service';
import { ResourceModule } from '../resource/resource.module';
import { PipelinesService } from '../pipelines/pipelines.service';
import { PipelinesRecordsService } from '../pipelines-records/pipelines-records.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ProjectsService } from '../projects/projects.service';
import { GitInfoService } from '../git-info/git-info.service';
import { NotifyService } from '../notify/notify.service';
import { BuildsModule } from '../builds/builds.module';
import { PackageErrorManualModule } from '../package-error-manual/package-error-manual.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { PipelinesRecordsModule } from '../pipelines-records/pipelines-records.module';
import { JenkinsInfoModule } from '../jenkins-info/jenkins-info.module';
import { TasksModule } from '../tasks/tasks.module';
import { GitInfoModule } from '../git-info/git-info.module';
import { ProjectsModule } from '../projects/projects.module';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { NotifyModule } from '../notify/notify.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TasksEntity,
      UsersEntity,
      BuildsEntity,
      PackageErrorManualEntity,
      ProjectsEntity,
      PipelineRecordsEntity,
      JenkinsInfoEntity,
      GitInfoEntity,
    ]),
    ResourceModule,
    BuildsModule,
    PackageErrorManualModule,
    PipelinesModule,
    PipelinesRecordsModule,
    JenkinsInfoModule,
    TasksModule,
    GitInfoModule,
    ProjectsModule,
    MinioClientModule,
    NotifyModule,
  ],
  controllers: [BuildsForeignController],
  providers: [SentryService, BuildsForeignService],
  exports: [BuildsForeignService],
})
export class BuildsForeignModule {}
