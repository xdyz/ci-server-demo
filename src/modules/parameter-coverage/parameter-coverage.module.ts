import { Module } from '@nestjs/common';
import { ParameterCoverageService } from './parameter-coverage.service';
import { ParameterCoverageController } from './parameter-coverage.controller';

@Module({
  controllers: [ParameterCoverageController],
  providers: [ParameterCoverageService]
})
export class ParameterCoverageModule {}
