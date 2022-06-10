import { IsInt } from 'class-validator';

export default class CreateParameterCoverageDto {
  @IsInt()
  task_id: number;

  parameters?: any;
}
