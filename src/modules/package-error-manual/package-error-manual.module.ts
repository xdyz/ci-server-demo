import { Module } from '@nestjs/common';
import { PackageErrorManualService } from './package-error-manual.service';
import { PackageErrorManualController } from './package-error-manual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageErrorManualEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([PackageErrorManualEntity])],
  controllers: [PackageErrorManualController],
  providers: [PackageErrorManualService],
  exports: [PackageErrorManualService],
})
export class PackageErrorManualModule {}
