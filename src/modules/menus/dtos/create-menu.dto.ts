import { IsInt, IsString } from 'class-validator';

export default class CreateMenuDto {
  @IsString({
    message: '菜单名称 必须为字符串',
  })
  name: string;

  @IsString({
    message: '菜单路径 必须为字符串',
  })
  path: string;

  @IsInt({
    message: '菜单是否隐藏 必须为整数',
  })
  hide_in_menu: number;

  @IsInt({
    message: '菜单父级 必须为整数',
  })
  parent_id: number;

  @IsString({
    message: '菜单图标 必须为字符串',
  })
  icon?: string;

  @IsString({
    message: '菜单跳转 必须为字符串',
  })
  redirect?: string;
}
