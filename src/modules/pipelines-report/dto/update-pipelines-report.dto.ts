import { PartialType } from '@nestjs/swagger';
import CreatePipelinesReportDto from './create-pipelines-report.dto';

export default class UpdatePipelinesReportDto extends PartialType(
  CreatePipelinesReportDto,
) {}
