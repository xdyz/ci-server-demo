import { Module } from '@nestjs/common';
import { ServerManagersService } from './server-managers.service';
import { ServerManagersController } from './server-managers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([BuildsEntity, TasksEntity])],
  controllers: [ServerManagersController],
  providers: [ServerManagersService],
  exports: [ServerManagersService],
})
export class ServerManagersModule {}
