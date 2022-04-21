import { Module } from '@nestjs/common';
import { PipelinesService } from './pipeline-list/pipelines.service';
import { PipelinesController } from './pipeline-list/pipelines.controlleroller';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineRecordsEntity, PipelinesEntity } from 'src/entities';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/pipelines',
        module: PipelinesModule,
      },
    ]),
    TypeOrmModule.forFeature([PipelinesEntity, PipelineRecordsEntity]),
  ],
  controllers: [PipelinesController],
  providers: [PipelinesService],
})
export class PipelinesModule {}
