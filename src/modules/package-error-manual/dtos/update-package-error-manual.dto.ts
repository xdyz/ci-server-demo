import { PartialType } from '@nestjs/swagger';
import { CreatePackageErrorManualDto } from './create-package-error-manual.dto';

export class UpdatePackageErrorManualDto extends PartialType(CreatePackageErrorManualDto) {}
