import BaseEntity from './baseEntity';
import { Entity, Column } from 'typeorm';
@Entity('resource_terms')
export default class ResourceTermsEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'category_id',
  })
  category_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'rule_uid',
  })
  rule_uid: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'rule_name',
  })
  rule_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'rule_desc',
  })
  rule_desc: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'suggest',
    nullable: true,
  })
  suggest: string;

  @Column({
    type: 'tinyint',
    name: 'level',
  })
  level: number;

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
    type: 'json',
    name: 'threshold_range',
    nullable: true,
  })
  threshold_range: string;

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
