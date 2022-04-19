import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ResourceCategoryEntity,
  ResourceCategoryExtraEntity,
  ResourceInstanceEntity,
  ResourceInstanceItemsEntity,
  ResourceTermsEntity,
} from 'src/entities';
import { ResourceCategoryController } from './category/category.contorller';

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
  controllers: [ResourceCategoryController],
  providers: [],
})
export class ResourceModule {}
