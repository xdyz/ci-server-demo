import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';

@Module({
  imports: [PackageErrorManualService],
  controllers: [PackageController],
  providers: [PackageService],
})
export class PackageModule {}
