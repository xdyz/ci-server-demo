import { Type } from 'class-transformer';

export class GetTestErrorManualDto {
  @Type(() => Number)
  page: number;

  @Type(() => Number)
  size: number;
}
