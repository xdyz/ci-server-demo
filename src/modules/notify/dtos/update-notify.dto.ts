import { PartialType } from '@nestjs/swagger';
import CreateNotifyDto from './create-notify.dto';

export default class UpdateNotifyDto extends PartialType(CreateNotifyDto) {}
