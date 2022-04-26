import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksEntity } from 'src/entities';
import { SentryService } from '@ntegral/nestjs-sentry';

@Module({
  imports: [TypeOrmModule.forFeature([TasksEntity])],
  controllers: [TasksController],
  providers: [TasksService, SentryService],
  exports: [TasksService],
})
export class TasksModule {}
