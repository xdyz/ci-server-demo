import { PartialType } from '@nestjs/swagger';
import { CreateTestErrorManualDto } from './create-test-error-manual.dto';

export class UpdateTestErrorManualDto extends PartialType(
  CreateTestErrorManualDto,
) {}
