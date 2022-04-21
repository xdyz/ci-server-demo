import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { RouterModule } from '@nestjs/core';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/tasks',
        module: TasksModule,
      },
    ]),
    JenkinsInfoService,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
