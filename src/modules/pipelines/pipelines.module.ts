import { forwardRef, Inject, Module } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { PipelinesController } from './pipelines.controller';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineRecordsEntity, PipelinesEntity } from 'src/entities';
import { PipelinesRecordsService } from '../pipelines-records/pipelines-records.service';
import { TasksService } from '../tasks/tasks.service';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PipelinesReportService } from '../pipelines-report/pipelines-report.service';
import { WsService } from '../websocket/ws.service';
import { NotifyService } from '../notify/notify.service';
import { BuildsService } from '../builds/builds.service';
import { HttpService } from '@nestjs/axios';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { JenkinsInfoModule } from '../jenkins-info/jenkins-info.module';
import { WsModule } from '../websocket/ws.module';
import { NotifyModule } from '../notify/notify.module';
import { TasksModule } from '../tasks/tasks.module';
import { PipelinesRecordsModule } from '../pipelines-records/pipelines-records.module';
import { BuildsModule } from '../builds/builds.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([PipelinesEntity, PipelineRecordsEntity]),
    JenkinsInfoModule,
    WsModule,
    NotifyModule,
    forwardRef(() => PipelinesRecordsModule),
    forwardRef(() => BuildsModule),
  ],
  controllers: [PipelinesController],
  providers: [PipelinesService],
  exports: [PipelinesService],
})
export class PipelinesModule {}
