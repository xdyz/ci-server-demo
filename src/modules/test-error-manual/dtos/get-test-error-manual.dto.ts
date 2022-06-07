import { Type } from 'class-transformer';

export default class GetTestErrorManualDto {
  @Type(() => Number)
  page: number;

  @Type(() => Number)
  size: number;
}
