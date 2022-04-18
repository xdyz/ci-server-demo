import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';
@Entity('projects')
export default class ProjectsEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'label',
  })
  label: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'image_url',
    nullable: true,
  })
  image_url: string;
}
