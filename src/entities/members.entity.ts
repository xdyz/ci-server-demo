import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('members')
export default class MembersEntity extends BaseEntity {
  @Column({
    type: 'int',
    name: 'user_id',
  })
  userId: number;

  @Column({
    type: 'int',
    name: 'role_id',
    nullable: true,
  })
  roleId: number;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
