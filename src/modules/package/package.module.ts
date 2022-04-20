import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { PackageErrorManualService } from '../package-error-manual/package-error-manual.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuildsEntity, TasksEntity } from 'src/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuildsEntity, TasksEntity]),
    PackageErrorManualService,
  ],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}
