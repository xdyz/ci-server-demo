import { PartialType } from '@nestjs/swagger';
import CreateRoleDto from './create-role.dto';

export default class UpdateRoleDto extends PartialType(CreateRoleDto) {}
