import { PartialType } from '@nestjs/swagger';
import CreateServerManagerDto from './create-server-manager.dto';

export default class UpdateServerManagerDto extends PartialType(
  CreateServerManagerDto,
) {}
