import { Column, Entity } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('package_data_edit')
export default class PackageDataEdit extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: '255',
  })
  name: string;

  @Column({
    name: 'path',
    type: 'json',
  })
  path: string[];

  @Column({
    name: 'tags',
    type: 'json',
  })
  tags: string[];

  @Column({
    name: 'updated_user',
    type: 'int',
  })
  updated_user: number;

  @Column({
    name: 'created_user',
    type: 'int',
  })
  created_user: number;

  @Column({
    name: 'project_id',
    type: 'int',
  })
  project_id: number;
}
