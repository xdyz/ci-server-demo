import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('jenkins_info')
export default class JenkinsInfoEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'protocol',
    length: 255,
  })
  protocol: string;

  @Column({
    type: 'varchar',
    name: 'hostname',
    length: 255,
  })
  hostname: string;

  @Column({
    type: 'mediumint',
    name: 'port',
  })
  port: number;

  @Column({
    type: 'varchar',
    name: 'user_name',
    length: 255,
  })
  user_name: string;

  @Column({
    type: 'varchar',
    name: 'token',
    length: 255,
  })
  token: string;

  @Column({
    type: 'varchar',
    name: 'display_name',
    length: 255,
  })
  display_name: string;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
