import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('roles')
export default class RolesEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 256,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'json',
    name: 'privileges',
  })
  privileges: string;

  @Column({
    type: 'tinyint',
    name: 'project_root',
    default: 0,
    // enum: [0, 1],
  })
  project_root: number;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
