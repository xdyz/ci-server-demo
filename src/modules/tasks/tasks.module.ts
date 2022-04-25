import { forwardRef, Module } from '@nestjs/common';
import { TasksService } from './list/tasks.service';
import { TasksController } from './list/tasks.controller';
import { RouterModule } from '@nestjs/core';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';
import { ResourceInstanceItemsService } from '../resource/items/items.service';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ProjectsService } from '../projects/projects.service';
import { GitInfoService } from '../git-info/git-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BuildsEntity,
  PackageErrorManualEntity,
  TasksEntity,
  UsersEntity,
} from 'src/entities';
import { BuildsController } from './builds/builds.controller';
import { TasksForeignController } from './foreign/foreign.contorller';
import { BuildsService } from './builds/builds.service';
import { TasksForeignService } from './foreign/foreign.service';
import { HttpService } from '@nestjs/axios';
import { WsService } from '../websocket/ws.service';
import { ResourceTermsService } from '../resource/terms/terms.service';
import { PipelinesListService } from '../pipelines/pipeline-list/pipeline-list.service';
import { ResourceCategoryService } from '../resource/category/category.service';
import { JenkinsInfoModule } from '../jenkins-info/jenkins-info.module';
import { PackageErrorManualModule } from '../package-error-manual/package-error-manual.module';
import { ResourceModule } from '../resource/resource.module';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { WsModule } from '../websocket/ws.module';
import { GitInfoModule } from '../git-info/git-info.module';
import { ProjectsModule } from '../projects/projects.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { PipelinesRecordsService } from '../pipelines/records/records.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/tasks',
        module: TasksModule,
      },
    ]),
    TypeOrmModule.forFeature([TasksEntity, BuildsEntity, UsersEntity]),
    // JenkinsInfoModule,
    // PackageErrorManualModule,
    // ResourceModule,
    // MinioClientModule,
    // WsModule,
    // GitInfoModule,
    // ProjectsModule,
    forwardRef(() => PipelinesModule),
    // PipelinesModule,

    // JenkinsInfoService,
    // PackageErrorManualService,
    // ResourceInstanceItemsService,
    // MinioService,
    // ProjectsService,
    // GitInfoService,
  ],
  controllers: [TasksController, BuildsController, TasksForeignController],
  providers: [
    JenkinsInfoService,
    PackageErrorManualService,
    ResourceInstanceItemsService,
    MinioClientService,
    ProjectsService,
    GitInfoService,
    WsService,
    PipelinesListService,
    TasksService,
    BuildsService,
    TasksForeignService,
    ResourceTermsService,
    ResourceCategoryService,
  ],
  exports: [TasksService, BuildsService, TasksForeignService],
})
export class TasksModule {}
