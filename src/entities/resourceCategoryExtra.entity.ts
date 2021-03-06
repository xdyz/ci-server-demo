import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('resource_category_extra')
export default class ResourceCategoryExtraEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'category_id',
    nullable: false,
  })
  category_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'category_uid',
    nullable: false,
  })
  category_uid: string;

  @Column({
    type: 'json',
    name: 'global_params',
    nullable: false,
  })
  global_params: any;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
