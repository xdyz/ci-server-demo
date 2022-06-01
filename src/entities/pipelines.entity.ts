import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('pipelines')
export default class PipelinesEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: '255',
    nullable: false,
  })
  name: string;

  // @Column({
  //   name: 'user_id',
  //   type: 'json',
  //   nullable: false
  // })
  // user_id: number[];

  @Column({
    name: 'nodes',
    type: 'longtext',
    nullable: false,
  })
  nodes: any;

  @Column({
    name: 'notify_enable',
    type: 'tinyint',
  })
  notify_enable: number;

  @Column({
    name: 'edges',
    type: 'longtext',
    nullable: false,
  })
  edges: any;

  @Column({
    name: 'document_url',
    type: 'varchar',
    length: '255',
    nullable: true,
  })
  document_url: string;

  @Column({
    name: 'created_user',
    type: 'int',
  })
  created_user: number;

  @Column({
    name: 'owner_users',
    type: 'json',
  })
  owner_users: any;

  @Column({
    name: 'description',
    type: 'varchar',
    length: '255',
    nullable: true,
  })
  description: string;

  @Column({
    name: 'notify_users',
    type: 'varchar',
    nullable: true,
  })
  notify_users: string;

  @Column({
    name: 'schedule_time',
    type: 'datetime',
    nullable: true,
  })
  schedule_time: Date;

  @Column({
    name: 'timing',
    type: 'json',
    nullable: true,
  })
  timing: any;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
