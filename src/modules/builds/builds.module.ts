import { forwardRef, Module } from '@nestjs/common';
import { BuildsService } from './builds.service';
import { BuildsController } from './builds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity, UsersEntity } from 'src/entities';
import { ResourceModule } from '../resource/resource.module';
import { SentryService } from '@ntegral/nestjs-sentry';
import { JenkinsInfoModule } from '../jenkins-info/jenkins-info.module';
import { TasksModule } from '../tasks/tasks.module';
import { WsModule } from '../websocket/ws.module';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { ProjectsModule } from '../projects/projects.module';
import { NotifyModule } from '../notify/notify.module';
import { PipelinesModule } from '../pipelines/pipelines.module';
import { GitInfoModule } from '../git-info/git-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildsEntity, UsersEntity, TasksEntity]),
    ResourceModule,
    JenkinsInfoModule,
    WsModule,
    MinioClientModule,
    ProjectsModule,
    NotifyModule,
    GitInfoModule,
    forwardRef(() => PipelinesModule),
    TasksModule,
  ],
  controllers: [BuildsController],
  providers: [SentryService, BuildsService],
  exports: [BuildsService],
})
export class BuildsModule {}
