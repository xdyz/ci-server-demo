import { PartialType } from '@nestjs/swagger';
import { CreateParameterCoverageDto } from './create-parameter-coverage.dto';

export class UpdateParameterCoverageDto extends PartialType(
  CreateParameterCoverageDto,
) {}
