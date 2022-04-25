import { Module } from '@nestjs/common';
import { GitInfoService } from './git-info.service';
import { GitInfoController } from './git-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GitInfoEntity } from 'src/entities';
// import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([GitInfoEntity])],
  controllers: [GitInfoController],
  providers: [GitInfoService],
  exports: [GitInfoService],
})
export class GitInfoModule {}
