import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('package_error_manual')
export default class PackageErrorManualEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'key_words',
    length: 255,
  })
  key_words: string;

  @Column({
    type: 'varchar',
    name: 'problem',
    length: 255,
  })
  problem: string;

  @Column({
    type: 'varchar',
    name: 'solution',
    length: 255,
  })
  solution: string;

  @Column({
    type: 'json',
    name: 'tags',
    nullable: true,
  })
  tags: any;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
