import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { PackageErrorManualService } from './package-error-manual.service';
import { CreatePackageErrorManualDto } from './dtos/create-package-error-manual.dto';
import { UpdatePackageErrorManualDto } from './dtos/update-package-error-manual.dto';

@Controller('package-error-manual')
export class PackageErrorManualController {
  constructor(
    private readonly packageErrorManualService: PackageErrorManualService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageErrorManualService.getManualErrors(req.session, req.query);
  //   }
  // });
  @Get()
  async getManualErrors(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getPackageErrorManualDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.getManualErrors(
      user,
      getPackageErrorManualDto,
    );
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.packageErrorManualService.setManualError(req.session, req.body);
  //   }
  // });
  @Post()
  async setManualError(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createPackageErrorManualDto: CreatePackageErrorManualDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.setManualError(
      user,
      createPackageErrorManualDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.packageErrorManualService.updateManualError(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  async updateManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updatePackageErrorManualDto: UpdatePackageErrorManualDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.updateManualError(
      id,
      updatePackageErrorManualDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageErrorManualService.deleteManualError(req.params.id);
  //   }
  // });
  @Delete(':id')
  async deleteManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.deleteManualError(+id);
  }

  // app.get('/ids', {
  //   preHandler:  app.verifyAuthorization,
  //   handler: async (req) => {
  //     let { ids } = req.query;
  //     ids = ids ? ids.split(',').map(item => Number(item)): [];
  //     return await app.services.packageErrorManualService.getManualErrorsByIds(req.session, ids);
  //   }
  // });
  @Get('ids')
  async getManualErrorsByIds(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query('ids') ids: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    const idsArr = ids ? ids.split(',').map((item) => Number(item)) : [];
    return await this.packageErrorManualService.getManualErrorsByIds(
      user,
      idsArr,
    );
  }

  // app.get('/all', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.packageErrorManualService.getAllErrorsManuals(req.session);
  //   }
  // });
  @Get('all')
  async getAllErrorsManuals(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.packageErrorManualService.getAllErrorsManuals(user);
  }
}
