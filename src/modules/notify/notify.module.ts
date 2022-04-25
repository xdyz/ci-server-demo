import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { NotifyController } from './notify.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImManagerEntity } from 'src/entities';
import { SentryService } from '@ntegral/nestjs-sentry';
import { HttpService } from '@nestjs/axios';
import { AxiosModule } from '../axios/axios.module';
@Module({
  imports: [TypeOrmModule.forFeature([ImManagerEntity])],
  controllers: [NotifyController],
  providers: [NotifyService, SentryService],
  exports: [NotifyService],
})
export class NotifyModule {}
