import { PartialType } from '@nestjs/swagger';
import CreateAutoTestDto from './create-auto-test.dto';

export default class UpdateAutoTestDto extends PartialType(CreateAutoTestDto) {}
