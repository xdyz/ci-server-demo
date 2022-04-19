import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ResourceCategoryEntity,
  ResourceCategoryExtraEntity,
  ResourceInstanceEntity,
  ResourceInstanceItemsEntity,
  ResourceTermsEntity,
} from 'src/entities';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'resource',
        module: ResourceModule,
      },
    ]),
    TypeOrmModule.forFeature([
      ResourceCategoryEntity,
      ResourceCategoryExtraEntity,
      ResourceInstanceEntity,
      ResourceInstanceItemsEntity,
      ResourceTermsEntity,
    ]),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
