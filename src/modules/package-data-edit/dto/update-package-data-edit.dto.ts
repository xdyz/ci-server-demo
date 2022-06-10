import { PartialType } from '@nestjs/swagger';
import CreatePackageDataEditDto from './create-package-data-edit.dto';

export default class UpdatePackageDataEditDto extends PartialType(
  CreatePackageDataEditDto,
) {}
