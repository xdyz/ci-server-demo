import { Module } from '@nestjs/common';
import { GitInfoService } from './git-info.service';
import { GitInfoController } from './git-info.controller';

@Module({
  controllers: [GitInfoController],
  providers: [GitInfoService]
})
export class GitInfoModule {}
