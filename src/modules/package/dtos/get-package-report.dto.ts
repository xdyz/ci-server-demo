import { Type } from 'class-transformer';

export class GetPackageReportDto {
  @Type(() => Number)
  from: number;

  @Type(() => Number)
  to: number;
}
