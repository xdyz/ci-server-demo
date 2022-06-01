import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class GetPackageErrorManual {
  @Type(() => Number)
  page: number;

  @Type(() => Number)
  size: number;

  @IsString()
  key_words?: string;

  @IsString()
  problem?: string;

  @IsString()
  solution?: string;
}
