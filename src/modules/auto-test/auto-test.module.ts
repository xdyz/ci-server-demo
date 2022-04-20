import { Module } from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { AutoTestController } from './auto-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { MinioService } from '../minio/minio.service';
import { TasksService } from '../tasks/tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildsEntity]),
    MinioService,
    TasksService,
  ],
  controllers: [AutoTestController],
  providers: [AutoTestService],
})
export class AutoTestModule {}
