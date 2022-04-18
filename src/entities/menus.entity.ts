import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('menus')
export default class MenusEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    length: 255,
  })
  name: string;

  @Column({
    type: 'tinyint',
    name: 'parent_id',
    default: 0,
  })
  parent_id: number;

  @Column({
    type: 'varchar',
    name: 'icon',
    length: 255,
    nullable: true,
  })
  icon: string;

  @Column({
    type: 'varchar',
    name: 'path',
    length: 255,
  })
  path: string;

  @Column({
    type: 'tinyint',
    name: 'hide_in_menu',
    nullable: true,
  })
  hide_in_menu: number;

  @Column({
    type: 'varchar',
    name: 'redirect',
    length: 255,
    nullable: true,
  })
  redirect: string;
}
