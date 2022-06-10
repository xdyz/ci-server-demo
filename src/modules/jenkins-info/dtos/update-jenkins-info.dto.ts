import { PartialType } from '@nestjs/swagger';
import CreateJenkinsInfoDto from './create-jenkins-info.dto';

export default class UpdateJenkinsInfoDto extends PartialType(
  CreateJenkinsInfoDto,
) {}
