import { Module } from '@nestjs/common';
import { PipelinesListService } from './pipeline-list/pipeline-list.service';
import { PipelinesListController } from './pipeline-list/pipeline-list.controller';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineRecordsEntity, PipelinesEntity } from 'src/entities';
import { PipelinesRecordsController } from './records/records.controller';
import { PipelinesRecordsService } from './records/records.service';
import { TasksService } from '../tasks/list/tasks.servicervice';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PipelinesRecordsReportController } from './report/report.controller';
import { PipelinesRecordsReportService } from './report/report.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/pipelines',
        module: PipelinesModule,
      },
    ]),
    TypeOrmModule.forFeature([PipelinesEntity, PipelineRecordsEntity]),
    TasksService,
    JenkinsInfoService,
  ],
  controllers: [
    PipelinesListController,
    PipelinesRecordsController,
    PipelinesRecordsReportController,
  ],
  providers: [
    PipelinesListService,
    PipelinesRecordsService,
    PipelinesRecordsReportService,
  ],
})
export class PipelinesModule {}
