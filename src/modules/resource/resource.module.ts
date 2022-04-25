import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BuildsEntity,
  ResourceCategoryEntity,
  ResourceCategoryExtraEntity,
  ResourceInstanceEntity,
  ResourceInstanceItemsEntity,
  ResourceTermsEntity,
} from 'src/entities';
import { MinioClientService } from '../minio-client/minio-client.service';
import { ResourceCategoryController } from './category/category.contorller';
import { ResourceCategoryService } from './category/category.service';
import { ResourceInstancesController } from './instances/instances.controller';
import { ResourceInstancesService } from './instances/instances.service';
import { ResourceInstanceItemsController } from './items/items.controller';
import { ResourceInstanceItemsService } from './items/items.service';
import { ResourceRecordsController } from './records/records.controller';
import { ResourceRecordsService } from './records/records.service';
import { ResourceTermsController } from './terms/terms.controller';
import { ResourceTermsService } from './terms/terms.service';

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
      BuildsEntity,
    ]),
  ],
  controllers: [
    ResourceCategoryController,
    ResourceTermsController,
    ResourceInstancesController,
    ResourceInstanceItemsController,
    ResourceRecordsController,
  ],
  providers: [
    MinioClientService,
    ResourceCategoryService,
    ResourceTermsService,
    ResourceInstancesService,
    ResourceInstanceItemsService,
    ResourceRecordsService,
  ],
})
export class ResourceModule {}
