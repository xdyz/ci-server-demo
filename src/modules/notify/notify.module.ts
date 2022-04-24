import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { NotifyController } from './notify.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImManagerEntity } from 'src/entities';
import { SentryService } from '@ntegral/nestjs-sentry';

@Module({
  imports: [TypeOrmModule.forFeature([ImManagerEntity]), SentryService],
  controllers: [NotifyController],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
