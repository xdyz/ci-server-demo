import { forwardRef, Module } from '@nestjs/common';
import { AutoTestService } from './auto-test.service';
import { AutoTestController } from './auto-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { MinioClientService } from '../minio-client/minio-client.service';
import { TasksService } from '../tasks/list/tasks.service';
import { TestErrorManualService } from '../test-error-manual/test-error-manual.service';
import { MinioClientModule } from '../minio-client/minio-client.module';
import { TasksModule } from '../tasks/tasks.module';
import { TestErrorManualModule } from '../test-error-manual/test-error-manual.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildsEntity]),
    MinioClientModule,

    // forwardRef(() => TasksModule),
    // TasksModule,
    TestErrorManualModule,
  ],
  controllers: [AutoTestController],
  providers: [
    // MinioClientService,
    TasksService,
    // TestErrorManualService,
    AutoTestService,
  ],
  exports: [AutoTestService],
})
export class AutoTestModule {}
