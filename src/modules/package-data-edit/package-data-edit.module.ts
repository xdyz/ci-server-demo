import { Module } from '@nestjs/common';
import { PackageDataEditService } from './package-data-edit.service';
import { PackageDataEditController } from './package-data-edit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageDataEditEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([PackageDataEditEntity])],
  controllers: [PackageDataEditController],
  providers: [PackageDataEditService],
  exports: [PackageDataEditService],
})
export class PackageDataEditModule {}
