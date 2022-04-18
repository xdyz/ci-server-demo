import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('tasks') // 表的名称
export default class TasksEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  display_name: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string;

  @Column({
    name: 'document_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  document_url: string;

  @Column({
    name: 'jenkins_id',
    type: 'int',
    nullable: false,
  })
  jenkins_id: number;

  @Column({
    name: 'view_id',
    type: 'int',
    nullable: false,
  })
  view_id: number;

  @Column({
    name: 'project_id',
    type: 'int',
    nullable: false,
  })
  project_id: number;
}
