import { PartialType } from '@nestjs/swagger';
import { CreateServerManagerDto } from './create-server-manager.dto';

export class UpdateServerManagerDto extends PartialType(CreateServerManagerDto) {}
