import { IsArray, IsInt, IsString } from 'class-validator';

export default class CreateTestErrorManualDto {
  @IsInt({
    message: '错误码必须为整数',
  })
  error_code: number;

  @IsString({
    message: '错误信息必须为字符串',
  })
  problem: string;

  @IsString({
    message: '解决方案必须为字符串',
  })
  solution: string;

  @IsArray({
    message: '标签必须为数组',
  })
  tags: string[];
}
