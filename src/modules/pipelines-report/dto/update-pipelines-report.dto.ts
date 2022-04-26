import { PartialType } from '@nestjs/swagger';
import { CreatePipelinesReportDto } from './create-pipelines-report.dto';

export class UpdatePipelinesReportDto extends PartialType(CreatePipelinesReportDto) {}
