import { IsString } from 'class-validator';

export default class CreateViewDto {
  @IsString({
    message: 'The name must be a string',
  })
  name: string;

  @IsString({
    message: 'The description must be a string',
  })
  display_name: string;
}
