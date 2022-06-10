import { Type } from 'class-transformer';

export default class GetPackageReportDto {
  @Type(() => Number)
  from: number;

  @Type(() => Number)
  to: number;
}
