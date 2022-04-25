import { Module } from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { AutoTestController } from './auto-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { MinioClientService } from '../minio-client/minio-client.service';
import { TasksService } from '../tasks/list/tasks.service';
import { TestErrorManualService } from '../test-error-manual/test-error-manual.service';

@Module({
  imports: [TypeOrmModule.forFeature([BuildsEntity])],
  controllers: [AutoTestController],
  providers: [
    AutoTestService,
    MinioClientService,
    TasksService,
    TestErrorManualService,
  ],
  exports: [AutoTestService],
})
export class AutoTestModule {}
