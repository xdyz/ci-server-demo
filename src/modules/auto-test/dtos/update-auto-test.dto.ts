import { PartialType } from '@nestjs/swagger';
import { CreateAutoTestDto } from './create-auto-test.dto';

export class UpdateAutoTestDto extends PartialType(CreateAutoTestDto) {}
