import { Module } from '@nestjs/common';
import { PackageErrorManualService } from './package-error-manual.service';
import { PackageErrorManualController } from './package-error-manual.controller';

@Module({
  controllers: [PackageErrorManualController],
  providers: [PackageErrorManualService],
  exports: [PackageErrorManualService],
})
export class PackageErrorManualModule {}
