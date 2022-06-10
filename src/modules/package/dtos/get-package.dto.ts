import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export default class GetPackageDto {
  @Type(() => Number)
  page: number;

  @Type(() => Number)
  size: number;

  @Type(() => Number)
  status: number;

  @IsString({
    message: '搜索关键字 平台 必须为字符串',
  })
  paltform?: string;
}
