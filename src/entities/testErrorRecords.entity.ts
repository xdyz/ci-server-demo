import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';
@Entity('test_error_records')
export default class TestErrorRecordsEntity extends BaseEntity {
  @Column({
    type: 'json',
    name: 'fail_types',
    comment: '失败类型',
    nullable: true,
  })
  fail_types: any;

  @Column({
    type: 'int',
    name: 'build_id',
    comment: '构建id',
  })
  build_id: string;

  @Column({
    type: 'int',
    name: 'user_id',
    comment: '用户id',
  })
  user_id: string;

  @Column({
    name: 'project_id',
    type: 'int',
    comment: '项目id',
  })
  project_id: number;
}
