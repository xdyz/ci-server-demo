import { Module } from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { AutoTestController } from './auto-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { TasksModule } from '../tasks/tasks.module';
import { TestErrorManualModule } from '../test-error-manual/test-error-manual.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildsEntity]),
    MinioClientModule,
    TasksModule,
    TestErrorManualModule,
  ],
  controllers: [AutoTestController],
  providers: [AutoTestService],
  exports: [AutoTestService],
})
export class AutoTestModule {}
