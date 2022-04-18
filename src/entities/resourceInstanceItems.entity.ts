import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('resource_instance_items')
export default class ResourceInstanceItemsEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'instance_id',
  })
  instance_id: number;

  @Column({
    type: 'int',
    name: 'term_id',
  })
  term_id: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'detect_paths',
  })
  detect_paths: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'filter_paths',
    nullable: true,
  })
  filter_paths: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'filter_regex',
    nullable: true,
  })
  filter_regex: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'threshold_value',
    nullable: true,
  })
  threshold_value: string;

  @Column({
    type: 'tinyint',
    name: 'enabled',
    default: '1',
  })
  enabled: number;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
