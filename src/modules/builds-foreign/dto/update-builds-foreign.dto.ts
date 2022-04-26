import { PartialType } from '@nestjs/swagger';
import { CreateBuildsForeignDto } from './create-builds-foreign.dto';

export class UpdateBuildsForeignDto extends PartialType(CreateBuildsForeignDto) {}
