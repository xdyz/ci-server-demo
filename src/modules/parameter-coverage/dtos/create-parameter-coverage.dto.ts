import { IsInt } from 'class-validator';

export class CreateParameterCoverageDto {
  @IsInt()
  task_id: number;

  parameters?: any;
}
