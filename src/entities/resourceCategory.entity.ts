import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('resource_category')
export default class ResourceCategoryEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'category_ame',
    nullable: false,
  })
  category_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'category_uid',
    nullable: false,
  })
  category_uid: string;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
