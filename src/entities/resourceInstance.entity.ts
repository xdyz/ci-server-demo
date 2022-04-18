import BaseEntity from './baseEntity';
import { Entity, Column } from 'typeorm';

@Entity('resource_instance')
export default class ResourceInstanceEntity extends BaseEntity {
  /**
   * 实例名称
   * @example 资源检查
   */

  @Column({
    type: 'varchar',
    name: 'name',
    length: 255,
    nullable: false,
  })
  name: string;

  /**
   * 创建者
   * @example 1
   */
  @Column({
    type: 'int',
    name: 'user_id',
    nullable: false,
  })
  user_id: number;

  /**
   * 项目id
   * @example 1
   */

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
