import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResourceTermsService } from './terms.service';
// import { CreateCategoryDto, UpdateCategoryDto, CreateExtraDto } from '../dtos';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('检查像')
@Controller('terms')
@UseInterceptors(ClassSerializerInterceptor)
export class ResourceTermsController {
  constructor(private readonly resourceTermsService: ResourceTermsService) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.getResourceTerms(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取所有检查项信息' })
  async getResourceTerms(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceTermsService.getResourceTerms(user, query);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.insertReourceTerms(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '添加检查项' })
  async insertResourceTerms(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceTermsService.insertResourceTerms(user, body);
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.updateReourceTerms(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新检查项' })
  async updateResourceTerms(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceTermsService.updateResourceTerms(id, body);
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.deleteReourceTerms(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除检查项' })
  async deleteResourceTerms(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceTermsService.deleteResourceTerms(+id);
  }

  // app.delete('/:category_id/all', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.deleteResourceTermsByCateId(req.params.category_id);
  //   }
  // });
  @Delete(':category_id/all')
  @ApiOperation({ summary: '删除检查项' })
  async deleteResourceTermsByCateId(
    // @Request() req: any,
    // @Headers('project_id') project_id: string,
    @Param('category_id') category_id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.resourceTermsService.deleteResourceTermsByCateId(
      +category_id,
    );
  }

  // app.post('/upload', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     const data = await req.file();
  //     const buffer = await data.toBuffer();
  //     return await app.services.resourceService.uploadResourceTerms(req.session, buffer);
  //   }
  // });
  @Post('upload')
  @ApiOperation({ summary: '上传检查项' })
  async uploadResourceTerms(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Body() body: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceTermsService.uploadResourceTerms(user, body);
  }

  // app.get('/getOne', {
  //   handler: async (req) => {
  //     const { project_id } = req.query;
  //     return await app.services.resourceService.getAllResourceTermsToUnity({ project_id });
  //   }
  // });
  @Get('getOne')
  @ApiOperation({ summary: '获取所有检查项信息' })
  async getAllResourceTermsToUnity(@Request() req: any, @Query() query: any) {
    return await this.resourceTermsService.getAllResourceTermsToUnity(query);
  }
}
