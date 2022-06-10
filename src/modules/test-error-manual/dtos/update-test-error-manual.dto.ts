import { PartialType } from '@nestjs/swagger';
import CreateTestErrorManualDto from './create-test-error-manual.dto';

export default class UpdateTestErrorManualDto extends PartialType(
  CreateTestErrorManualDto,
) {}
