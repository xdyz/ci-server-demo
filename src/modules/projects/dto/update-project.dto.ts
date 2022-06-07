import { PartialType } from '@nestjs/swagger';
import CreateProjectDto from './create-project.dto';

export default class UpdateProjectDto extends PartialType(CreateProjectDto) {}
