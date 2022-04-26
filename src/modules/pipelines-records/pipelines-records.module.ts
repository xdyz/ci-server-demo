import { forwardRef, Module } from '@nestjs/common';
import { PipelinesRecordsService } from './pipelines-records.service';
import { PipelinesRecordsController } from './pipelines-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineRecordsEntity } from 'src/entities';
import { PipelinesService } from '../pipelines/pipelines.service';
import { PipelinesModule } from '../pipelines/pipelines.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PipelineRecordsEntity]),
    forwardRef(() => PipelinesModule),
  ],
  controllers: [PipelinesRecordsController],
  providers: [PipelinesRecordsService],
  exports: [PipelinesRecordsService],
})
export class PipelinesRecordsModule {}
