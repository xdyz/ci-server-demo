import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('parameter_coverage')
export default class parameterCoverageEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'task_id',
    comment: '任务id',
  })
  task_id: number;

  @Column({
    type: 'int',
    name: 'user_id',
    comment: '用户id',
  })
  user_id: number;

  @Column({
    type: 'json',
    name: 'parameters',
    comment: '参数',
    nullable: true,
  })
  parameters: any;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
