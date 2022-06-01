import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { PackageDataEditService } from './package-data-edit.service';
import { CreatePackageDataEditDto } from './dto/create-package-data-edit.dto';
import { UpdatePackageDataEditDto } from './dto/update-package-data-edit.dto';

@Controller('package-data-edit')
export class PackageDataEditController {
  constructor(
    private readonly packageDataEditService: PackageDataEditService,
  ) {}

  @Post()
  async createPackageDataEdit(
    @Request() req,
    @Body() createPackageDataEditDto: CreatePackageDataEditDto,
  ) {
    return await this.packageDataEditService.createPackageDataEdit(
      req.user,
      createPackageDataEditDto,
    );
  }

  @Get()
  async findByPageSize(@Request() req, @Query() query) {
    return await this.packageDataEditService.findByPageSize(req.user, query);
  }

  @Patch(':id')
  async updatePackageDataEdit(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePackageDataEditDto: UpdatePackageDataEditDto,
  ) {
    return await this.packageDataEditService.updatePackageDataEdit(
      req.user,
      +id,
      updatePackageDataEditDto,
    );
  }

  @Delete(':id')
  async deletePackageDataEdit(@Param('id') id: string) {
    return await this.packageDataEditService.deletePackageDataEdit(+id);
  }
}
