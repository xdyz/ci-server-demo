import { Type } from 'class-transformer';

export default class GetRoleDto {
  @Type(() => Number)
  page: number;

  @Type(() => Number)
  size: number;

  @Type(() => Number)
  project_id: number;
}
