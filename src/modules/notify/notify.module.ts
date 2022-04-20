import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { NotifyController } from './notify.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImManagerEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ImManagerEntity])],
  controllers: [NotifyController],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
