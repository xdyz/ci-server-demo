import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { ViewsController } from './views.controller';
import { TasksService } from '../tasks/tasks.service';

@Module({
  exports: [TasksService],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
