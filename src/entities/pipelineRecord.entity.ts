import BaseEntity from './baseEntity';
import { Column, Entity } from 'typeorm';

@Entity('pipeline_records')
export default class PipelineRecordsEntity extends BaseEntity {
  @Column({
    name: 'name',
    type: 'varchar',
    length: '255',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'pipeline_id',
    type: 'int',
    nullable: false,
  })
  pipeline_id: number;

  @Column({
    name: 'status',
    type: 'int',
  })
  status: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  user_id: number;

  @Column({
    name: 'nodes',
    type: 'json',
    nullable: false,
  })
  nodes: any;

  @Column({
    name: 'edges',
    type: 'json',
    nullable: false,
  })
  edges: any;

  @Column({
    name: 'document_url',
    type: 'varchar',
    length: '255',
  })
  document_url: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: '255',
  })
  description: string;

  @Column({
    name: 'create_user',
    type: 'int',
    nullable: false,
  })
  create_users: number;

  @Column({
    type: 'int',
    name: 'project_id',
    comment: '项目id',
  })
  project_id: number;
}
