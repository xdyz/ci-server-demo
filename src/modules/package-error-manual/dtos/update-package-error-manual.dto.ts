import { PartialType } from '@nestjs/swagger';
import CreatePackageErrorManualDto from './create-package-error-manual.dto';

export default class UpdatePackageErrorManualDto extends PartialType(
  CreatePackageErrorManualDto,
) {}
