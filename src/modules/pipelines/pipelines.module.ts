import { forwardRef, Inject, Module } from '@nestjs/common';
import { PipelinesListService } from './pipeline-list/pipeline-list.service';
import { PipelinesListController } from './pipeline-list/pipeline-list.controller';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineRecordsEntity, PipelinesEntity } from 'src/entities';
import { PipelinesRecordsController } from './records/records.controller';
import { PipelinesRecordsService } from './records/records.service';
import { TasksService } from '../tasks/list/tasks.service';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PipelinesRecordsReportController } from './report/report.controller';
import { PipelinesRecordsReportService } from './report/report.service';
import { WsService } from '../websocket/ws.service';
import { NotifyService } from '../notify/notify.service';
import { BuildsService } from '../tasks/builds/builds.service';
import { HttpService } from '@nestjs/axios';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { JenkinsInfoModule } from '../jenkins-info/jenkins-info.module';
import { WsModule } from '../websocket/ws.module';
import { NotifyModule } from '../notify/notify.module';
import { TasksModule } from '../tasks/tasks.module';
@Module({
  imports: [
    RouterModule.register([
      {
        path: 'pipelines',
        module: PipelinesModule,
      },
    ]),
    TypeOrmModule.forFeature([PipelinesEntity, PipelineRecordsEntity]),
    JenkinsInfoModule,
    WsModule,
    NotifyModule,
    forwardRef(() => TasksModule),
    // TasksModule,
    ScheduleModule,
  ],
  controllers: [
    PipelinesListController,
    PipelinesRecordsController,
    PipelinesRecordsReportController,
  ],
  providers: [
    // JenkinsInfoService,
    // WsService,
    // NotifyService,
    // BuildsService,
    // SchedulerRegistry,
    // TasksService,
    PipelinesListService,
    PipelinesRecordsService,
    PipelinesRecordsReportService,
  ],
  exports: [
    PipelinesListService,
    PipelinesRecordsService,
    PipelinesRecordsReportService,
  ],
})
export class PipelinesModule {}
