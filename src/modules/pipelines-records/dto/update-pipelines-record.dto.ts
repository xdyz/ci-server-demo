import { PartialType } from '@nestjs/swagger';
import { CreatePipelinesRecordDto } from './create-pipelines-record.dto';

export class UpdatePipelinesRecordDto extends PartialType(CreatePipelinesRecordDto) {}
