import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { ViewsController } from './views.controller';
import { TasksService } from '../tasks/list/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksEntity, ViewsEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ViewsEntity, TasksEntity])],
  exports: [ViewsService],
  controllers: [ViewsController],
  providers: [ViewsService, TasksService],
})
export class ViewsModule {}
