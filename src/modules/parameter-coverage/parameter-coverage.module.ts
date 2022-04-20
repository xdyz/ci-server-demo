import { Module } from '@nestjs/common';
import { ParameterCoverageService } from './parameter-coverage.service';
import { ParameterCoverageController } from './parameter-coverage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParameterCoverageEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ParameterCoverageEntity])],
  controllers: [ParameterCoverageController],
  providers: [ParameterCoverageService],
  exports: [ParameterCoverageService],
})
export class ParameterCoverageModule {}
