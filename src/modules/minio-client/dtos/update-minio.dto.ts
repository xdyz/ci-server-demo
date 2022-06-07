import { PartialType } from '@nestjs/swagger';
import CreateMinioDto from './create-minio.dto';

export default class UpdateMinioDto extends PartialType(CreateMinioDto) {}
