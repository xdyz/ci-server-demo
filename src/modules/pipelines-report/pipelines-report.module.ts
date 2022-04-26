import { forwardRef, Module } from '@nestjs/common';
import { PipelinesReportService } from './pipelines-report.service';
import { PipelinesReportController } from './pipelines-report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BuildsEntity,
  PipelineRecordsEntity,
  PipelinesEntity,
} from 'src/entities';
import { TasksService } from '../tasks/tasks.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { PipelinesModule } from '../pipelines/pipelines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BuildsEntity,
      PipelineRecordsEntity,
      PipelinesEntity,
    ]),
    forwardRef(() => PipelinesModule),
  ],
  controllers: [PipelinesReportController],
  providers: [PipelinesReportService],
  exports: [PipelinesReportService],
})
export class PipelinesReportModule {}
