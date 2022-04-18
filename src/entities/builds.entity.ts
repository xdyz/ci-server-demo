import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';
@Entity('builds')
export default class BuildsEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'task_id',
    comment: '任务id',
    nullable: true,
  })
  task_id: number;

  @Column({
    type: 'int',
    name: 'user_id',
    comment: '用户id',
    nullable: true,
  })
  user_id: number;

  @Column({
    type: 'int',
    name: 'number',
    comment: '构建编号',
  })
  number: number;

  @Column({
    type: 'json',
    name: 'parameters',
    comment: '构建参数',
  })
  parameters: any;

  @Column({
    type: 'int',
    name: 'status',
    comment: '构建状态',
  })
  status: number;

  @Column({
    type: 'int',
    name: 'duration',
    comment: '构建耗时',
  })
  duration: number;

  @Column({
    type: 'varchar',
    name: 'badges',
    length: 255,
    comment: '分支',
  })
  badges: string;

  @Column({
    type: 'varchar',
    name: 'custom_data',
    length: 2048,
    comment: '自定义数据',
  })
  custom_data: string;

  @Column({
    type: 'varchar',
    name: 'job_name',
    length: 255,
    comment: '任务名称',
  })
  job_name: string;

  @Column({
    type: 'varchar',
    name: 'build_type',
    length: 255,
    comment: '构建类型',
  })
  build_type: string;

  @Column({
    type: 'varchar',
    name: 'platform',
    length: 255,
    nullable: true,
    comment: '平台',
  })
  platform: string;

  @Column({
    type: 'varchar',
    name: 'error_manual_ids',
    length: 255,
    nullable: true,
    comment: '手动添加的错误id',
  })
  error_manual_ids: string;

  @Column({
    type: 'varchar',
    name: 'file_path',
    length: 255,
    nullable: true,
    comment: '文件路径',
  })
  file_path: string;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
