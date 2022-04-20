import { Module } from '@nestjs/common';
import { JenkinsInfoService } from './jenkins-info.service';
import { JenkinsInfoController } from './jenkins-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JenkinsInfoEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([JenkinsInfoEntity])],
  controllers: [JenkinsInfoController],
  providers: [JenkinsInfoService],
  exports: [JenkinsInfoService],
})
export class JenkinsInfoModule {}
