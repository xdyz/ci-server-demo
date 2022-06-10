import { PartialType } from '@nestjs/swagger';
import CreatePipelinesRecordDto from './create-pipelines-record.dto';

export default class UpdatePipelinesRecordDto extends PartialType(
  CreatePipelinesRecordDto,
) {}
