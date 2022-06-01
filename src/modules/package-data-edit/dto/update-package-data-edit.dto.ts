import { PartialType } from '@nestjs/swagger';
import { CreatePackageDataEditDto } from './create-package-data-edit.dto';

export class UpdatePackageDataEditDto extends PartialType(CreatePackageDataEditDto) {}
