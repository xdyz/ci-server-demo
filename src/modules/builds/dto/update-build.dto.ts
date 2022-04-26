import { PartialType } from '@nestjs/swagger';
import { CreateBuildDto } from './create-build.dto';

export class UpdateBuildDto extends PartialType(CreateBuildDto) {}
