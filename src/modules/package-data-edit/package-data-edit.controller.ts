import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PackageDataEditService } from './package-data-edit.service';
import { CreatePackageDataEditDto } from './dto/create-package-data-edit.dto';
import { UpdatePackageDataEditDto } from './dto/update-package-data-edit.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('package-data-edit')
@UseGuards(AuthGuard('jwt'))
@ApiTags('包数据编辑')
export class PackageDataEditController {
  constructor(
    private readonly packageDataEditService: PackageDataEditService,
  ) {}

  @Post()
  @ApiOperation({ summary: '配置包数据编辑' })
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
  @ApiOperation({ summary: '获取包数据编辑' })
  async findByPageSize(@Request() req, @Query() query) {
    return await this.packageDataEditService.findByPageSize(req.user, query);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新包数据编辑' })
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
  @ApiOperation({ summary: '删除单个包数据编辑' })
  async deletePackageDataEdit(@Param('id') id: string) {
    return await this.packageDataEditService.deletePackageDataEdit(+id);
  }
}
