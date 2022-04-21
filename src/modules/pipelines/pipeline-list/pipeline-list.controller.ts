import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dtoo';
import { UpdatePipelineDto } from './dto/update-pipeline.dtoo';

@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post()
  create(@Body() createPipelineDto: CreatePipelineDto) {
    return this.pipelinesService.create(createPipelineDto);
  }

  @Get()
  findAll() {
    return this.pipelinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pipelinesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePipelineDto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.update(+id, updatePipelineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pipelinesService.remove(+id);
  }
}
