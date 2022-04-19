import { Module } from '@nestjs/common';
import { JenkinsInfoService } from './jenkins-info.service';
import { JenkinsInfoController } from './jenkins-info.controller';

@Module({
  controllers: [JenkinsInfoController],
  providers: [JenkinsInfoService]
})
export class JenkinsInfoModule {}
