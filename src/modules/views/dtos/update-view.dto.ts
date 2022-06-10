import { PartialType } from '@nestjs/swagger';
import CreateViewDto from './create-view.dto';

export default class UpdateViewDto extends PartialType(CreateViewDto) {}
