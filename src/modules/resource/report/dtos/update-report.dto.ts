import { PartialType } from '@nestjs/swagger';
import CreateReportDto from './create-report.dto';

export default class UpdateReportDto extends PartialType(CreateReportDto) {}
