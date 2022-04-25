import { Entity, Column } from 'typeorm';
import BaseEntity from './baseEntity';

@Entity('git_webhooks')
export default class ImManagerEntity extends BaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    length: 255,
  })
  name: string;

  @Column({
    type: 'int',
    name: 'agentid',
  })
  agentid: number;

  @Column({
    type: 'varchar',
    name: 'corpid',
    length: 20,
  })
  corpid: string;

  @Column({
    type: 'varchar',
    name: 'corpsecret',
    length: 50,
  })
  corpsecret: string;

  @Column({
    type: 'char',
    name: 'type',
    length: 255,
  })
  type: string;
}
