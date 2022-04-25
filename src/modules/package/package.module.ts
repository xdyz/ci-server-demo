import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity } from 'src/entities';
import { PackageErrorManualModule } from '../package-error-manual/package-error-manual.module';
import { JenkinsInfoService } from '../jenkins-info/jenkins-info.service';
import { HttpService } from '@nestjs/axios';
import { JenkinsInfoModule } from '../jenkins-info/jenkins-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildsEntity, TasksEntity]),
    PackageErrorManualModule,
    JenkinsInfoModule,
  ],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}
