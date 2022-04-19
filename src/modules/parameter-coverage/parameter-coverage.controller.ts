import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Request,
  Put,
} from '@nestjs/common';
import { ParameterCoverageService } from './parameter-coverage.service';
import { CreateParameterCoverageDto } from './dtos/create-parameter-coverage.dto';
import { UpdateParameterCoverageDto } from './dtos/update-parameter-coverage.dto';

@Controller('parameter-coverage')
export class ParameterCoverageController {
  constructor(
    private readonly parameterCoverageService: ParameterCoverageService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.getParameterCoverage(req.session);
  //   }
  // });
  @Get()
  async getParameterCoverage(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.getParameterCoverage(user);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.createParameterCoverage(req.session, req.body);
  //   }
  // });
  @Post()
  async createParameterCoverage(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createParameterCoverageDto: CreateParameterCoverageDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.createParameterCoverage(
      user,
      createParameterCoverageDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.updateParameterCoverage(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  async updateParameterCoverage(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updateParameterCoverageDto: UpdateParameterCoverageDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.updateParameterCoverage(
      id,
      updateParameterCoverageDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.parameterCoverageService.deleteParameterCoverage(req.params.id);
  //   }
  // });
  @Delete(':id')
  async deleteParameterCoverage(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.parameterCoverageService.deleteParameterCoverage(+id);
  }
}
