import { PartialType } from '@nestjs/swagger';
import { CreateNotifyDto } from './create-notify.dto';

export class UpdateNotifyDto extends PartialType(CreateNotifyDto) {}
