import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('git_info')
export default class GitInfoEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'url',
    length: 255,
  })
  url: string;

  @Column({
    type: 'char',
    name: 'token',
    length: 21,
  })
  token: string;

  @Column({
    type: 'varchar',
    name: 'git_project_id',
    length: 10,
  })
  git_project_id: string;

  @Column({
    type: 'char',
    name: 'tag',
    length: 50,
  })
  tag: string;

  @Column({
    type: 'varchar',
    name: 'ssh',
    length: 255,
    nullable: true,
  })
  ssh: string;

  @Column({
    type: 'json',
    name: 'git_url',
    nullable: true,
  })
  git_url: any;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
