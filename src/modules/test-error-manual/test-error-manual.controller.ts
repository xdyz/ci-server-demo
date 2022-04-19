import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Headers,
  Request,
} from '@nestjs/common';
import { TestErrorManualService } from './test-error-manual.service';
import { CreateTestErrorManualDto } from './dtos/create-test-error-manual.dto';
import { UpdateTestErrorManualDto } from './dtos/update-test-error-manual.dto';

@Controller('test-error-manual')
export class TestErrorManualController {
  constructor(
    private readonly testErrorManualService: TestErrorManualService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.testErrorManualService.getManualErrors(req.session, req.query);
  //   }
  // });
  @Get()
  async getManualErrors(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getTestErrorManualDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.getManualErrors(
      user,
      getTestErrorManualDto,
    );
  }

  // app.get('/all', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.testErrorManualService.getAllManualErrors(req.session);
  //   }
  // });
  @Get('all')
  async getAllManualErrors(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.getAllManualErrors(user);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.testErrorManualService.setManualError(req.session, req.body);
  //   }
  // });
  @Post()
  async setManualError(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createTestErrorManualDto: CreateTestErrorManualDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.setManualError(
      user,
      createTestErrorManualDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.testErrorManualService.updateManualError(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  async updateManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updateTestErrorManualDto: UpdateTestErrorManualDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.updateManualError(
      id,
      updateTestErrorManualDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.testErrorManualService.deleteManualError(req.params.id);
  //   }
  // });
  @Delete(':id')
  async deleteManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.deleteManualError(id);
  }

  // app.get('/ids', {
  //   preHandler:  app.verifyAuthorization,
  //   handler: async (req) => {
  //     let { ids } = req.query;
  //     ids = ids ? ids.split(',').map(item => Number(item)): [];
  //     return await app.services.testErrorManualService.getManualErrorsByIds(req.session, ids);
  //   }
  // });
  @Get('ids')
  async getManualErrorsByIds(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getTestErrorManualDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.getManualErrorsByIds(
      user,
      getTestErrorManualDto,
    );
  }
}
