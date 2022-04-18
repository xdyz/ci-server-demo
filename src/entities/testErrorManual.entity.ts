import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';
@Entity('test_error_manual')
export default class TestErrorManualEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'error_code',
    comment: '错误码',
  })
  errorCode: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'problem',
    comment: '问题',
  })
  problem: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'solution',
    comment: '解决方案',
  })
  solution: string;

  @Column({
    type: 'json',
    name: 'tags',
    comment: '标签',
  })
  tags: any;

  @Column({
    name: 'project_id',
    type: 'int',
    comment: '项目id',
  })
  project_id: number;
}
