import { Module } from '@nestjs/common';
import { TasksService } from './list/tasks.service';
import { TasksController } from './list/tasks.controller';
import { RouterModule } from '@nestjs/core';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';
import { ResourceInstanceItemsService } from '../resource/items/items.service';
import { MinioService } from '../minio/minio.service';
import { ProjectsService } from '../projects/projects.service';
import { GitInfoService } from '../git-info/git-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity, UsersEntity } from 'src/entities';
import { HttpService } from '@nestjs/axios';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/tasks',
        module: TasksModule,
      },
    ]),
    TypeOrmModule.forFeature([TasksEntity, BuildsEntity, UsersEntity]),
    JenkinsInfoService,
    PackageErrorManualService,
    ResourceInstanceItemsService,
    MinioService,
    ProjectsService,
    GitInfoService,
    HttpService,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
