import { IsString } from 'class-validator';

export default class CreatePackageErrorManualDto {
  @IsString()
  key_words: string;

  @IsString()
  problem: string;

  @IsString()
  solution: string;

  @IsString()
  tags?: string;
}
