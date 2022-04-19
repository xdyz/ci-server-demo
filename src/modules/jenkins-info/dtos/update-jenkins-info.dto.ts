import { PartialType } from '@nestjs/swagger';
import { CreateJenkinsInfoDto } from './create-jenkins-info.dto';

export class UpdateJenkinsInfoDto extends PartialType(CreateJenkinsInfoDto) {}
