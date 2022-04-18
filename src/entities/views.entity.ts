import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';
@Entity('views')
export default class ViewsEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    length: 255,
    comment: '视图名称',
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'display_name',
    length: 255,
    comment: '视图显示名称',
  })
  display_name: string;

  @Column({
    type: 'varchar',
    name: 'icon',
    length: 255,
    comment: '视图图片',
  })
  icon: string;

  @Column({
    name: 'project_id',
    type: 'int',
    comment: '项目id',
  })
  project_id: number;
}
