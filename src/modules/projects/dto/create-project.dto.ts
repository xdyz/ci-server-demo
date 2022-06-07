import { IsString } from 'class-validator';

export default class CreateProjectDto {
  @IsString()
  name: string;
}
