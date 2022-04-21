import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { RouterModule } from '@nestjs/core';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/tasks',
        module: TasksModule,
      },
    ]),
    JenkinsInfoService,
    PackageErrorManualService,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
